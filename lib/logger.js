var logLevel = -1
  , levels   = {
    'none'    : -1,
    'debug'   : 0,
    'info'    : 1,
    'notice'  : 2,
    'warning' : 3,
    'error'   : 4
};

exports.log = function (level, message) {
    if (logLevel <= levels[level]) {
        console.log(message);
    }
};

exports.getLogLevel = function () {
    return levels[logLevel];
};

exports.setLogLevel = function (level) {
    logLevel = levels[level];
};
