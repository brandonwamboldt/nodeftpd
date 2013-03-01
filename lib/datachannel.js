var config = require('./config')
  , state  = require('./state')
  , net    = require('net');

exports.create = function (session, callback) {
    // Create a generic TCP/IP server
    var server = net.createServer(function(socket) {
        // Call the given callback function, and give it a callback function to
        // execute when IT is done to close down the server again.
        callback(socket, function() {
            socket.end();
            server.close();

            delete state.data.passivePorts[state.data.passivePorts.indexOf(session.passiveMode.port)];
            session.passiveMode.port = 0;
        });
    });

    // Don't start the server if the port is zero
    if (session.passiveMode.port != 0) {
        server.listen(session.passiveMode.port, config.get('listen'));
        return true;
    } else {
        return false;
    }
};