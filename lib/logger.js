// Third party dependencies
var util   = require('util');
var fs     = require('fs');
var moment = require('moment');

// Local dependencies
var config     = require('../lib/config');
var supervisor = require('../lib/supervisor');

// Log stream
var errorLogStream  = fs.createWriteStream(config.logging.error_log, { flags: 'a' });
var accessLogStream = fs.createWriteStream(config.logging.access_log, { flags: 'a' });

/**
 *
 */
exports.log = function (destination) {
  // Convert the arguments object into an array, but exclude the first
  // argument (log level).
  var args = Array.prototype.slice.call(arguments, 1);

  // Easy colorized output
  if (supervisor.isDaemon()) {
    args[0] = args[0].replace(/<grey>(.*?)<\/grey>/gi, '$1');
    args[0] = args[0].replace(/<red>(.*?)<\/red>/gi, '$1');
    args[0] = args[0].replace(/<green>(.*?)<\/green>/gi, '$1');
    args[0] = args[0].replace(/<yellow>(.*?)<\/yellow>/gi, '$1');
    args[0] = args[0].replace(/<blue>(.*?)<\/blue>/gi, '$1');
    args[0] = args[0].replace(/<purple>(.*?)<\/purple>/gi, '$1');
    args[0] = args[0].replace(/<cyan>(.*?)<\/cyan>/gi, '$1');
  } else {
    args[0] = args[0].replace(/<grey>(.*?)<\/grey>/gi, '\u001b[90m$1\033[0m');
    args[0] = args[0].replace(/<red>(.*?)<\/red>/gi, '\033[31m$1\033[0m');
    args[0] = args[0].replace(/<green>(.*?)<\/green>/gi, '\033[32m$1\033[0m');
    args[0] = args[0].replace(/<yellow>(.*?)<\/yellow>/gi, '\033[33m$1\033[0m');
    args[0] = args[0].replace(/<blue>(.*?)<\/blue>/gi, '\033[34m$1\033[0m');
    args[0] = args[0].replace(/<purple>(.*?)<\/purple>/gi, '\033[35m$1\033[0m');
    args[0] = args[0].replace(/<cyan>(.*?)<\/cyan>/gi, '\033[36m$1\033[0m');
  }

  // Formatting
  var msg = '[' + moment().format('YYYY-MM-DD HH:mm:ss') + '] [' + destination + '] ' + util.format.apply(global, args);

  // Destination
  if (supervisor.isDaemon() && (destination === 'error' || destination === 'notice')) {
    errorLogStream.write(msg + '\n');
  } else if (supervisor.isDaemon()) {
    accessLogStream.write(msg + '\n');
  } else {
    process.stdout.write(msg + '\n');
  }
};
