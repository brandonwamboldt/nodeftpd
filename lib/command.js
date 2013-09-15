var app      = require('../lib/process_child');
var commands = [];

exports.add = function(command, callback, parameters) {
  if (typeof parameters != 'object') {
    parameters = {};
  }

  commands.push({command: command, callback: callback, parameters: parameters});
}

app.on('ftp:commandReceived', function (clientCommand, output, session) {
  var parameters, numParameters, handled = false;

  for (command in commands) {
    command = commands[command];

    if (clientCommand.toUpperCase().indexOf(command.command.toUpperCase()) === 0) {
      // Get the arguments passed to the command, trim whitespace
      parameters = clientCommand.substr(command.command.toUpperCase().length).trim();

      // Get the number of arguments passed, assume each argument is separated via whitespace
      numParameters = parameters === '' ? 0 : parameters.split(' ').length;

      // Mark the command as handled
      handled = true;

      // Validate the number of arguments received against what this function expects
      if (command.parameters.maxArguments === 0 && numParameters != 0) {
        output.write(501, 'Invalid number of arguments')
      } else if (command.parameters.minArguments > 0 && numParameters === 0) {
        output.write(501, 'Invalid number of arguments')
      } else {
        command.callback(parameters, output, session)
      }
    }
  }

  if (!handled) {
    output.write(500, clientCommand.trim() + ' not understood');
  }
});
