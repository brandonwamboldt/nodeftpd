// Third party dependencies
var net = require('net');
var tls = require('tls');

// Local dependencies
var supervisor = require('./supervisor');
var logger     = require('./logger');
var config     = require('./config');
var pkg        = require('../package.json');

// Expose some info
exports.version = pkg.version;
exports.config  = config;

/**
 * Log a message to the log file or stdout/stderr depending on daemon config.
 * @param {!string} destination
 * @param {!string} message
 * @param {mixed} ... format variables
 */
exports.log = logger.log;

/**
 * Are we running in daemon or foreground mode?
 * @return {boolean}
 */
exports.isDaemon = function () {
  return (process.argv.length >= 3 && process.argv[2].match(/--daemon/) && true);
};

/**
 * Create a new FTP server.
 * @return {net.Server}
 */
exports.createFtpServer = function (port, listenAddress, done) {
  var server = net.createServer(function (socket) {
    supervisor.useWorker().send('socket', socket);
  });

  server.listen(port, listenAddress, function () {
    logger.log('notice', 'net.Server listening on %s:%d', listenAddress, port);
    done(null);
  });

  server.on('close', function () {
    logger.log('notice', 'net.Server (%s:%d) is now closed', listenAddress, port);
  });

  process.on('shutdown', function () {
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
    logger.log('notice', 'tls.Server listening on %s:%d', listenAddress, port);
    done(null);
  });

  server.on('close', function () {
    logger.log('notice', 'tls.Server (%s:%d) is now closed', listenAddress, port);
  });

  process.on('shutdown', function () {
    if (server._handle) {
      server.close();
    }
  });

  return server;
};

/**
 * Create a net.Server using a local UNIX socket for use with the TLS server.
 * @return {net.Server}
 */
exports.createLocalSocket = function (socketPath, done) {
  var server = net.createServer(function (socket) {
    supervisor.useWorker().send('tls_socket', socket);
  });

  server.listen(socketPath, function () {
    logger.log('notice', 'net.Server listening on %s', socketPath);
    done(null);
  });

  server.on('close', function () {
    logger.log('notice', 'net.Server (%s) is now closed', socketPath);
  });

  process.on('shutdown', function () {
    if (server._handle) {
      server.close();
    }
  });

  return server;
};
