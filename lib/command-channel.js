// Third party dependencies
var util = require('util');

// Local dependencies
var logger = require('./logger');

/**
 * Create a new command channel with the given socket.
 * @param {!net.Socket} socket
 * @return {CommandChannel}
 */
exports.createChannel = function (socket) {
  return new CommandChannel(socket);
}

/**
 * FTP command channel class.
 * @param {!net.Socket} socket
 */
function CommandChannel (socket) {
  this.outputSocket = socket;
}

/**
 * Write a message to the command channel. Uses util.format for string
 * formatting.
 * @param {!integer} code
 * @param {!string} message
 * @param {mixed} ...arguments
 */
CommandChannel.prototype.write = function (code) {
  var message = util.format.apply(global, Array.prototype.slice.call(arguments, 1));

  // Format the message appropriately
  if (typeof code === 'number') {
    if (message.substr(0, 1) === '-') {
     message = code + message;
    } else {
      message = code + ' ' + message;
    }
  } else {
    message = ' ' + code;
  }

  // Write the message
  this.outputSocket.write(message + '\r\n');
  logger.log('info', '<grey>[%s:%d] Response:</grey> -> %s', this.outputSocket.remoteAddress, this.outputSocket.remotePort, message);
};

/**
 * Close the socket being used for this command channel.
 */
CommandChannel.prototype.close = function () {
  this.outputSocket.end();
};
