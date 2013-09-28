// Third party dependencies
var net = require('net');
var tls = require('tls');

// Local dependencies
var supervisor = require('../lib/supervisor');
var logger     = require('../lib/logger');

/**
 * Create a new FTP server.
 * @return {net.Server}
 */
exports.createFtpServer = function (port, listenAddress, done) {
  var server = net.createServer(function (socket) {
    supervisor.useWorker().send('socket', socket);
  });

  server.listen(port, listenAddress, function () {
    logger.log('info', '<green>[Server]</green> net.Server listening on %s:%d', listenAddress, port);
    done(null);
  });

  server.on('close', function () {
    logger.log('info', '<green>[Server]</green> net.Server (%s:%d) is now closed', listenAddress, port);
  });

  process.on('GRACEFULTERM', function () {
    if (server._handle) {
      server.close();
    }
  });

  return server;
};

/**
 * Create a new TLS server.
 * @return {tls.Server}
 */
exports.createFtpTlsServer = function (socketPath, port, listenAddress, options, done) {
  // Create a TLS TCP server
  var server = tls.createServer(options, function (clearTextStream) {
    var socket = net.connect(socketPath, function () {
      clearTextStream.pipe(socket);
    });

    socket.pipe(clearTextStream);
    socket.write('SETIP ' + clearTextStream.remoteAddress + ':' + clearTextStream.remotePort);
  });

  server.listen(port, listenAddress, function () {
    logger.log('info', '<green>[Server]</green> tls.Server listening on %s:%d', listenAddress, port);
    done(null);
  });

  server.on('close', function () {
    logger.log('info', '<green>[Server]</green> tls.Server (%s:%d) is now closed', listenAddress, port);
  });

  process.on('GRACEFULTERM', function () {
    if (server._handle) {
      server.close();
    }
  });

  return server;
}

/**
 * Create a net.Server using a local UNIX socket for use with the TLS server.
 * @return {net.Server}
 */
exports.createLocalSocket = function (socketPath, done) {
  var server = net.createServer(function (socket) {
    supervisor.useWorker().send('tls_socket', socket);
  });

  server.listen(socketPath, function () {
    logger.log('info', '<green>[Server]</green> net.Server listening on %s', socketPath);
    done(null);
  });

  server.on('close', function () {
    logger.log('info', '<green>[Server]</green> net.Server (%s) is now closed', socketPath);
  });

  process.on('GRACEFULTERM', function () {
    if (server._handle) {
      server.close();
    }
  });

  return server;
};
