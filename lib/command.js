// Dependencies
var app = require('../bin/worker.js');

// Registered commands
var commands = {};

/**
 * Register a command.
 * @param {!string} command
 * @param {string} helpText
 * @param {object} parameters
 * @param {!callable) callback
 */
exports.add = function (command, helpText, options, callback) {
  // Weird JS stuff for option arguments
  if (typeof helpText === 'function') {
    callback = helpText;
    options  = {};
    helpText = command + ' <sp> arguments';
  } else if (typeof helpText === 'object') {
    callback = options;
    options  = helpText;
    helpText = '';
  } else if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  // Add the command
  commands[command] = {
    command: command.toUpperCase(),
    helpText: helpText,
    parameters: options,
    callback: callback
  };
};

/**
 * Unregister a command.
 * @param {!string} command
 */
exports.remove = function (command) {
  delete commands[command];
};

/**
 * Check if the given command exists.
 * @param {!string} command
 * @return {boolean}
 */
exports.exists = function (command) {
  return typeof(commands[command.toUpperCase()]) !== 'undefined';
};

/**
 * Return the help text for the given command.
 * @param {!string} command
 * @return {string}
 */
exports.help = function (command) {
  return commands[command.toUpperCase()].helpText;
};

/**
 * Listen for new commands, and then call the appropriate callbacks.
 * @param {!string} clientCommand the command sent by the client
 * @param {!Output} output the command channel, used to send data to the client
 * @param {!Session} session the client's session
 */
app.on('ftp:commandReceived', function (clientCommand, output, session) {
  var parameters, numParameters, handled = false;

  for (var command in commands) {
    command = commands[command];

    if (clientCommand.toUpperCase().indexOf(command.command) === 0) {
      // Permissions
      if (!session.user && (command.command !== 'USER' && command.command !== 'PASS')) {
        handled = true;
        output.write(530, 'Please login with USER and PASS');
        break;
      }

      // Get the arguments passed to the command, trim whitespace
      parameters = clientCommand.substr(command.command.length).trim();

      // Get the number of arguments passed, assume each argument is separated via whitespace
      numParameters = parameters === '' ? 0 : parameters.split(' ').length;

      // Mark the command as handled
      handled = true;

      // Validate the number of arguments received against what this function expects
      if (command.parameters.maxArguments === 0 && numParameters !== 0) {
        output.write(501, 'Invalid number of arguments');
      } else if (command.parameters.minArguments > 0 && numParameters === 0) {
        output.write(501, 'Invalid number of arguments');
      } else {
        command.callback(parameters, output, session);
      }
    }
  }

  if (!handled) {
    output.write(500, clientCommand.trim() + ' not understood');
  }
});
