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

// Create the basic FTP server
tasks = [_.partial(nodeftpd.createFtpServer, config.port, config.listen)];

// Is implicit TLS support enabled?
if (config.tls.enabled) {
  var options = {
    key: fs.readFileSync(config.tls.key),
    cert: fs.readFileSync(config.tls.cert)
  };

  tasks.push(_.partial(nodeftpd.createLocalSocket, config.socket));
  tasks.push(_.partial(nodeftpd.createFtpTlsServer, config.socket, config.tls.port, config.listen, options));
}

// Don't disconnect from the main process until all servers are listening. This
// is so we can print out errors and have the user see if needed.
async.waterfall(tasks, function () {
  supervisor.spawnWorkers(config.idle_workers);
  process.send({ 'ready': true });
});

// Catch the SIGINT signal so we can do a graceful shutdown
process.on('SIGINT', function () {
  if (!supervisor.isDaemon()) {
    process.emit('GRACEFULTERM');

    if (fs.existsSync(config.pid_file)) {
      fs.unlinkSync(config.pid_file);
    }
  }
});

process.on('SIGTERM', function () {
  process.emit('GRACEFULTERM');

  if (fs.existsSync(config.pid_file)) {
    fs.unlinkSync(config.pid_file);
  }
});

process.on('GRACEFULTERM', function () {
  supervisor.killAllWorkers();
});

// Catch uncaught exceptions so we can do a graceful shutdown
process.on('uncaughtException', function (err) {
  var stackTrace = err.stack.split('\n');

  for (var i = 0; i < stackTrace.length; i++) {
    logger.log('error', '<red>[Exception Handler]</red> %s', stackTrace[i]);
  }

  process.emit('GRACEFULTERM');
});
