exports = module.exports = function(logger) {
    var outputSocket;

    function write(code, message) {
        if (typeof code == 'number') {
            if (message.substr(0, 1) == '-') {
                message = code + message;
            } else {
                message = code + ' ' + message;
            }
        } else {
            message = ' ' + code;
        }

        outputSocket.write(message + '\n');
        logger.log('info', '[' + outputSocket.remoteAddress + ':' + outputSocket.remotePort + '] Response: ' + message);
    }

    function setSocket(socket) {
        outputSocket = socket;
    }

    return {
        setSocket : setSocket,
        write     : write
    }
}