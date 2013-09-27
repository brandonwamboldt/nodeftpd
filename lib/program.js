// Third party dependencies
var forever = require('forever');
var path    = require('path');
var fs      = require('fs');

// Get the root application directory, uses to identify if a Forever process is
// the current application (source directory is basically the only unique thing
// forever gives us).
var rootDir = path.normalize(__dirname + '/..');

/**
 * We need a reference to the commander instance, so this class should be passed
 * the instance during require(), like this:
 *
 *   var nodeftpd = require('../lib/program.js')(program)
 *
 * We return an object with functions that map to command line actions.
 */
exports = module.exports = function (commander) {
  var nodeftpd = {};

  /**
   * Display commander.js help output.
   */
  nodeftpd.help = function () {
    commander.help();
  };

  /**
   * Display the status of the NodeFTPD daemon (display the process ID if it's
   * running).
   *
   * The daemon is run via Forever, so we use the Forever library to get a list
   * of processes that are being run through forever, and compare them to see if
   * any are run out of the same source directory as the current NodeFTPD
   * directory. If it is, we show that it's running and give the user the PID of
   * the process.
   */
  nodeftpd.status = function () {
    forever.startServer(function () {
      forever.list(false, function (err, processes) {
        var processCount = processes ? processes.length : 0;

        // Loop through each process to see if any are from the right directory
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
   * Stop any NodeFTPD instances.
   *
   * The daemon is run via Forever, so we use the Forever library to get a list
   * of processes that are being run through forever, and compare them to see if
   * any are run out of the same source directory as the current NodeFTPD
   * directory. If any processes are, we issue a forever.stop command.
   */
  nodeftpd.stop = function (done) {
    forever.startServer(function () {
      forever.list(false, function (err, processes) {
        // Loop through each process to see if any are from the right directory
        for (var index = 0; index < processes.length; index++) {
          if (processes[index].sourceDir === rootDir) {
            forever.stop(index);
          }
        }

        // If a callback was passed, execute it
        if (done && typeof done === 'function') done();
      });
    });
  };

  /**
   * Start NodeFTPD.
   *
   * Depending on command line flags, we'll easy run as a program in the
   * foreground or as a daemon. We use Forever to start the main executable.
   */
  nodeftpd.start = function () {
    // Get the right start function depending on whether or not we want to run
    // as a daemon
    var start = forever.start;

    if (commander.daemon) {
      start = forever.startDaemon;
    }

    // Are we running as root?
    if (process.getuid() !== 0) {
      console.log('Action \'start\' failed. You are not root.');
      process.exit(1);
    }

    // Ensure the log directory is created
    try {
      if (!fs.existsSync('/var/log/nodeftpd')) {
        fs.mkdirSync('/var/log/nodeftpd');
      }
    } catch (err) {
      throw err;
    }

    // Start the server
    start('bin/supervisor.js', {
      pidFile: commander.pidfile || '/var/run/nodeftpd.pid',
      errFile: commander.errfile || '/var/log/nodeftpd/error.log',
      outFile: commander.accessfile || '/var/log/nodeftpd/access.log',
      append: true,
      sourceDir: rootDir,
      max: 1
    });

    console.log('Starting NodeFTPD....');
  };

  /**
   * Stop any existing NodeFTPD instances and then start a new one.
   */
  nodeftpd.restart = function () {
    nodeftpd.stop(nodeftpd.start);
  };

  return nodeftpd;
};
