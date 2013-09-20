// Third party dependencies
var program = require('commander');
var forever = require('forever');
var path    = require('path');

// Get the root application directory
var rootDir = path.normalize(__dirname + '/..');

/**
 * Display commander.js help output.
 */
exports.help = function () {
  program.help();
};

/**
 * Display the status of the NodeFTPD daemon (display the process ID if it's
 * running).
 */
exports.status = function () {
  forever.startServer(function () {
    forever.list(false, function (err, processes) {
      var processCount = processes ? processes.length : 0;

      for (var index = 0; index < processCount; index++) {
        if (processes[index].sourceDir === rootDir) {
          console.log('nodeftpd (pid %s) is running...', processes[index].pid);
          process.exit();
        }
      }

      console.log('nodeftpd is stopped');
    });
  });
};

/**
 * Kill any NodeFTPD instances.
 */
exports.stop = function (done) {
  forever.startServer(function () {
    forever.list(false, function (err, processes) {
      for (var index = 0; index < processes.length; index++) {
        if (processes[index].sourceDir === rootDir) {
          forever.stop(index);
        }
      }

      if (done && typeof done === 'function') done();
    });
  });
};

/**
 * Start NodeFTPD as a daemon using Forever.
 */
exports.start = function () {
  forever.startDaemon('bin/supervisor.js', {
    pidFile: program.pidfile || '/var/run/nodeftpd.pid',
    logFile: program.logfile || '/var/log/nodeftpd/forever.log',
    errFile: program.errfile || '/var/log/nodeftpd/error.log',
    outFile: program.accessfile || '/var/log/nodeftpd/access.log',
    watch: false,
    append: true,
    sourceDir: rootDir,
    max: 1
  });

  console.log('Starting NodeFTPD....');
};

/**
 * Kill any NodeFTPD instances and then start NodeFTPD.
 */
exports.restart = function () {
  exports.stop(function () {
    exports.start();
  });
};
