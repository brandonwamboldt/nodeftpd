// Third party dependencies
var fork = require('child_process').fork;
var net  = require('net');

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
  // A new connection has been established, pass it off to one of the
  // spawned processes.
  var child = supervisor.useWorker();
  child.send('socket', socket);
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
