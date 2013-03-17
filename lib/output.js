var logger = require('./logger')
  , output = exports
  , outputSocket;

exports.create = function (socket) {
    return new Output(socket);
}

function Output(socket) {
    this.outputSocket = socket;
}

Output.prototype.write = function (code, message) {
    if (typeof code == 'number') {
        if (message.substr(0, 1) == '-') {
            message = code + message;
        } else {
            message = code + ' ' + message;
        }
    } else {
        message = ' ' + code;
    }

    this.outputSocket.write(message + '\n');
    logger.log('info', '[%s:%d] Response: %s',  this.outputSocket.remoteAddress, this.outputSocket.remotePort, message);
};

