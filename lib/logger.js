var levels = {
  'none'    : -1,
  'debug'   : 0,
  'info'    : 1,
  'notice'  : 2,
  'warning' : 3,
  'error'   : 4
};
var logLevel = -1;

exports.log = function (level) {
  // Only output the message if the configured log level is higher than than
  // log level of this message
  if (logLevel <= levels[level]) {
    // Convert the arguments object into an array, but exclude the first
    // argument (log level).
    var args = Array.prototype.slice.call(arguments, 1);

    // Append the process ID to all log messages created by child processes
    if (global.processType === 'child') {
      args[0] = '<grey>[' + process.pid + ']</grey> ' + args[0];
    } else {
      args[0] = '<grey>[parent]</grey> ' + args[0];
    }

    // Easy colorized output
    args[0] = args[0].replace(/<grey>(.*?)<\/grey>/gi, '\u001b[90m$1\033[0m');
    args[0] = args[0].replace(/<red>(.*?)<\/red>/gi, '\033[31m$1\033[0m');
    args[0] = args[0].replace(/<green>(.*?)<\/green>/gi, '\033[32m$1\033[0m');
    args[0] = args[0].replace(/<yellow>(.*?)<\/yellow>/gi, '\033[33m$1\033[0m');
    args[0] = args[0].replace(/<blue>(.*?)<\/blue>/gi, '\033[34m$1\033[0m');
    args[0] = args[0].replace(/<purple>(.*?)<\/purple>/gi, '\033[35m$1\033[0m');
    args[0] = args[0].replace(/<cyan>(.*?)<\/cyan>/gi, '\033[36m$1\033[0m');

    // Append two spaces to the first argument (Message to be logged)
    args[0] = '  ' + args[0];

    // Pass the arguments passed to this function to console.log
    console.log.apply(global, args);
  }
};

exports.getLogLevel = function () {
  return levels[logLevel];
};

exports.setLogLevel = function (level) {
  logLevel = levels[level];
};
