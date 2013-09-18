var config = require('./config');
var state  = require('./state');
var logger = require('./logger');
var net    = require('net');

exports.create = function (session, callback) {
  // Create a generic TCP/IP server
  var server = net.createServer(function (socket) {
    // Reference to this socket in the session
    session.dataChannel = socket;

    // Catch errors
    socket.on('error', function (err) {
      if (err.code !== 'ECONNRESET') {
        logger.log('error', 'Socket error in the data channel, err: ' + err);
      }
    });

    // Call the given callback function, and give it a callback function to
    // execute when IT is done to close down the server again.
    callback(socket, function() {
      // Update the bytes transferred
      session.bytesTransferred += socket.bytesRead + socket.bytesWritten;

      // No longer have a data channel
      session.dataChannel = false;

      // Close the socket & server
      socket.end();
      server.close();
    });
  });

  server.on('close', function () {
    state.data.passivePorts.splice(state.data.passivePorts.indexOf(session.passiveMode.port), 1);
    session.passiveMode.port = 0;
  });

  // Don't start the server if the port is zero
  if (session.passiveMode.port !== 0) {
    server.listen(session.passiveMode.port, config.listen);
    return true;
  } else {
    return false;
  }
};
