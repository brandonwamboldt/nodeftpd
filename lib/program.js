// Third party dependencies
var forever = require('forever');
var path    = require('path');
var fs      = require('fs');
var cp      = require('child_process');

// Local dependencies
var config = require('./config');

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
   */
  nodeftpd.status = function () {
    if (fs.existsSync(config.pid_file)) {
      var pid = fs.readFileSync(config.pid_file);

      process.stdout.write('NodeFTPD is running (pid ' + pid + ').\n');
    } else {
      process.stdout.write('NodeFTPD is NOT running.\n');
    }
  };

  /**
   * Stop any NodeFTPD instances.
   */
  nodeftpd.stop = function (done) {
    process.stdout.write('Stopping NodeFTPD.... ');

    if (fs.existsSync(config.pid_file)) {
      var pid = parseInt(fs.readFileSync(config.pid_file), 10);

      process.kill(pid, 'SIGTERM');
      process.stdout.write('Stopped\n');
    } else {
      process.stdout.write('Not running\n');
    }
  };

  /**
   * Start NodeFTPD.
   *
   * Depending on command line flags, we'll easy run as a program in the
   * foreground or as a daemon.
   */
  nodeftpd.start = function () {
    var args = [];

    if (commander.daemon) {
      args.push('--daemon');
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

    process.stdout.write('Starting NodeFTPD.... ');

    if (fs.existsSync(config.pid_file)) {
      process.stdout.write(' Already Running (pid ' + fs.readFileSync(config.pid_file) + ').\n');
      process.exit(1);
    }

    if (!commander.daemon) {
      process.stdout.write('\n');
    }

    // Start the server
    var supervisor = cp.fork('bin/supervisor', args);

    // The process will let us know when its ready (assuming successful start)
    supervisor.on('message', function (msg) {
      if (msg.ready && commander.daemon) {
        process.stdout.write('Done\n');
        process.exit(0);
      }
    });

    // Listen for the process to crash
    supervisor.on('exit', function (msg) {
      if (commander.daemon) {
        process.stdout.write('Failed\n');
        process.exit(1);
      }
    });

    // Write the process ID to the pid file
    fs.writeFileSync(config.pid_file, supervisor.pid);
  };

  /**
   * Stop any existing NodeFTPD instances and then start a new one.
   */
  nodeftpd.restart = function () {
    nodeftpd.stop(nodeftpd.start);
  };

  return nodeftpd;
};
