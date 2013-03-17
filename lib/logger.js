var logLevel = -1
  , levels   = {
    'none'    : -1,
    'debug'   : 0,
    'info'    : 1,
    'notice'  : 2,
    'warning' : 3,
    'error'   : 4
};

exports.log = function (level) {
    if (logLevel <= levels[level]) {
        // Convert the arguments object into an array, but exclude the first
        // argument (log level).
        var args = Array.prototype.slice.call(arguments, 1);

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
