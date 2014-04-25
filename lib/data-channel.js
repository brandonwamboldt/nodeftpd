// Third party dependencies
var net = require('net');
var tls = require('tls');
var fs  = require('fs');

// Local dependencies
var config = require('./config');
var logger = require('./logger');

// Keep track of the channel
var channel;

// Callback to send connections to
var listener;
var listenerSocket;
var listenerDoneCb;

// Load SSL certificates if needed
if (config.tls.enabled) {
  var tlsKey  = fs.readFileSync(config.tls.key);
  var tlsCert = fs.readFileSync(config.tls.cert);
}

/**
 * Create a data channel.
 * @param {!object} session
 * @param {!function} callback
 * @return {boolean}
 */
exports.create = function (session, callback) {
  if (session.mode === 'active') {
    channel = createActiveModeDataChannel(session, callback);
  } else if (session.mode === 'passive') {
    channel = createPassiveModeDataChannel(session, callback);
  } else {
    throw new Error('Data transfer mode is neither passive nor active');
  }

  return channel;
};

/**
 * Execute the callback when the data channel is ready.
 * @param {!object} session
 * @param {!function} callback
 * @return {boolean}
 */
exports.onReady = function (callback) {
  if (listenerSocket) {
    callback(listenerSocket, listenerDoneCb);
    listenerSocket = null;
    listenerDoneCb = null;
  } else {
    listener = callback;
  }

  return true;
};

/**
 * See if the data channel has been setup and is ready for a connection.
 * @return {boolean}
 */
exports.isReady = function () {
  return listenerSocket != null;
};

/**
 * Close the data channel.
 */
exports.close = function () {
  if (channel && (typeof channel.close !== 'undefined' || typeof channel.end !== 'undefined')) {
    channel.close();
    channel        = false;
    listenerSocket = null;
    listenerDoneCb = null;
  }
};

/**
 * Call the listener callback once we have a connection.
 */
var sendToListener = function (socket, done) {
  if (listener) {
    listener(socket, done);
    listener       = null;
    listenerSocket = null;
    listenerDoneCb = null;
  } else {
    listenerSocket = socket;
    listenerDoneCb = done;
  }
};

/**
 * Create a data channel for passive mode file transfers using a TCP server.
 * @param {!object} session
 * @param {!function} callback
 */
var createPassiveModeDataChannel = function (session, callback) {
  var connectionHandler = function (socket) {
    // Attempt to prevent PASV connection theft using PASV IP protected. We drop
    // the data connection if the IP address connected to the PASV port does not
    // match the client's IP address. This does not stop all attacks.
    if (session.clientIp !== socket.remoteAddress) {
      socket.end();
    }

    process.on('GRACEFULTERM', function () {
      socket.destroy();
      server.close();
    });

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
    sendToListener(socket, function () {
      // Update the bytes transferred
      session.bytesTransferred += socket.bytesRead + socket.bytesWritten;

      // No longer have a data channel
      session.dataChannel = false;

      // Close the socket & server
      socket.end();
      server.close();
      channel = false;
    });
  };

  var server;

  // Create a generic TCP/IP server
  if (session.isSecure) {
    var options = {
      key: tlsKey,
      cert: tlsCert
    };

    server = tls.createServer(options, connectionHandler);
  } else {
    server = net.createServer(connectionHandler);
  }

  server.on('close', function () {
    process.send({ action: 'free_passive_port', port: session.passiveMode.port });
    session.passiveMode.port = 0;
  });

  // Don't start the server if the port is zero
  if (session.passiveMode.port !== 0) {
    server.listen(session.passiveMode.port, config.listen, callback);
  } else {
    return false;
  }
};

/**
 * Create a data channel for active mode file transfers using a TCP connection.
 * @param {!object} session
 * @param {!function} callback
 */
var createActiveModeDataChannel = function (session, callback) {
  // Don't start the connection if the port is zero
  if (session.activeMode.clientPort === 0) {
    return false;
  }

  var client;
  var connectionHandler = function () {
    // Reference to this socket in the session
    session.dataChannel = client;

    // We're connected to the client
    callback();

    // Call the given callback function, and give it a callback function to
    // execute when IT is done to close down the server again.
    sendToListener(client, function() {
      // Update the bytes transferred
      session.bytesTransferred += client.bytesRead + client.bytesWritten;

      // No longer have a data channel
      session.dataChannel = false;

      // Close the socket
      client.end();
      channel = false;
    });
  };

  // Open a TCP connection
  if (session.isSecure) {
    var options = {
      host: session.activeMode.clientIp,
      port: session.activeMode.clientPort,
      key: tlsKey,
      cert: tlsCert
    };

    client = tls.connect(options, connectionHandler);
  } else {
    client = net.connect(session.activeMode.clientPort, session.activeMode.clientIp, connectionHandler);
  }

  // Catch errors
  client.on('error', function (err) {
    if (err.code !== 'ECONNRESET') {
      logger.log('error', 'Socket error in the data channel, err: ' + err);
    }
  });

  // Close up loose ends
  client.on('close', function () {
    session.activeMode.clientIp = '';
    session.activeMode.clientPort = 0;
  });

  return client;
};
