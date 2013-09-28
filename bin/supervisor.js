// Third party dependencies
var fork  = require('child_process').fork;
var net   = require('net');
var tls   = require('tls');
var fs    = require('fs');
var async = require('async');
var _     = require('lodash');

// Local dependencies
var config     = require('../lib/config');
var logger     = require('../lib/logger');
var supervisor = require('../lib/supervisor');
var nodeftpd   = require('../lib/nodeftpd');
var pkg        = require('../package.json');

// Starting
logger.log('notice', 'NodeFTPD/%s configured -- resuming normal operations', pkg.version);

// Create the basic FTP server
tasks = [_.partial(nodeftpd.createFtpServer, config.port, config.listen)];

if (config.tls.enabled) {
  // Read in the key file and certificate needed to establish a TLS connection
  var options = {
    key: fs.readFileSync(config.tls.key),
    cert: fs.readFileSync(config.tls.cert)
  };

  // Create a UNIX socket to act as an intermediary between the supervisor and
  // workers when using TLS, since we can't pass a TLS ClearTextStream between
  // processes.
  tasks.push(_.partial(
    nodeftpd.createLocalSocket,
    config.socket
  ));

  // Create a TLS server to handle FTP over implicit TLS connections. Implicit
  // TLS means the connection starts in TLS mode, and is not negotiated using
  // the AUTH TLS command.
  tasks.push(_.partial(
    nodeftpd.createFtpTlsServer,
    config.socket,
    config.tls.port,
    config.listen,
    options
  ));
}

// Don't spawn workers until all over our servers are spun up. This is so we
// don't spawn workers just to have one of the servers fail and have to kill the
// workers
async.waterfall(tasks, function () {
  supervisor.spawnWorkers(config.idle_workers);
  process.send({ 'ready': true });
});

// Catch the SIGINT signal so we can do a graceful shutdown is the process is
// running in the foreground, or discard it if we're running in the background.
process.on('SIGINT', function () {
  if (!supervisor.isDaemon()) {
    logger.log('notice', 'caught SIGINT, shutting down');
    process.emit('shutdown');
  } else {
    logger.log('notice', 'caught SIGINT, ignoring');
  }
});

// Catch the SIGTERM signal so we can clean up before shutting down
process.on('SIGTERM', function () {
  logger.log('notice', 'caught SIGTERM, shutting down');
  process.emit('shutdown');
});

// Catch uncaught exceptions so we can do a graceful shutdown. We don't want to
// try to recover as unpredictable things can happen.
process.on('uncaughtException', function (err) {
  var stackTrace = err.stack.split('\n');

  for (var i = 0; i < stackTrace.length; i++) {
    logger.log('error', '<red>[Exception Handler]</red> %s', stackTrace[i]);
  }

  process.emit('shutdown');
});

// Emitted by anything that causes us to shutdown and can be caught. Kill any
// worker processes and clean up the PID file.
process.on('shutdown', function () {
  supervisor.killAllWorkers();

  if (fs.existsSync(config.pid_file)) {
    fs.unlinkSync(config.pid_file);
  }
});
