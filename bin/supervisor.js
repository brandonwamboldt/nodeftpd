// Third party dependencies
var fork = require('child_process').fork;
var net  = require('net');
var tls  = require('tls');
var fs   = require('fs');

// Local dependencies
var config     = require('../lib/config');
var logger     = require('../lib/logger');
var supervisor = require('../lib/supervisor');

// Set the logging level
logger.setLogLevel(config.log_level);

// Create a pool of 5 child processes to handle new connections. We always
// want at least 5 child processes available. Each one takes about 30ms to
// start up and uses ~10mb of memory. Results may vary.
supervisor.spawnWorkers(5);

// Create a new TCP Server
var server = net.createServer(function (socket) {
  supervisor.useWorker().send('socket', socket);
});

// Is implicit TLS support enabled?
if (config.tls.enabled) {
  var options = {
    key: fs.readFileSync(config.tls.key),
    cert: fs.readFileSync(config.tls.cert)
  };

  // Create a TLS TCP server
  var tlsServer = tls.createServer(options, function (clearTextStream) {
    var socket = net.connect('/var/run/nodeftpd.sock', function () {
      clearTextStream.pipe(socket);
    });

    socket.pipe(clearTextStream);
    socket.write('SETIP ' + clearTextStream.remoteAddress + ':' + clearTextStream.remotePort);
  });

  // Start the server and bind to the appropriate port
  tlsServer.listen(config.tls.port, config.listen, function () {
    logger.log('info', '<green>[Daemon]</green> Starting NodeFTPD (TLS)');
    logger.log('info', '<green>[Daemon]</green> Listening on %s:%d (TLS)', config.listen, config.port);
  });

  // Listen for the server.close event
  tlsServer.on('close', function () {
    logger.log('info', '<green>[Daemon]</green> Shutting down NodeFTPD (TLS)');
  });
}

// Since we can't pass TLS clear text streams between processes, we use a socket
// server as an intermediary. This is secure thing both processes are on the
// same server.
var masterServer = net.createServer(function (socket) {
  supervisor.useWorker().send('tls_socket', socket);
});

// Listen on our UNIX socket
masterServer.listen('/var/run/nodeftpd.sock');

// Clean up our socket server
process.on('SIGINT', function () {
  masterServer.close(function () {
    process.exit();
  });
});

// Start the server and bind to the appropriate port
server.listen(config.port, config.listen, function () {
  logger.log('info', '<green>[Daemon]</green> Starting NodeFTPD');
  logger.log('info', '<green>[Daemon]</green> Listening on %s:%d', config.listen, config.port);
});

// Listen for the server.close event
server.on('close', function () {
  logger.log('info', '<green>[Daemon]</green> Shutting down NodeFTPD');
});
