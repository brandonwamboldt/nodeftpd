exports = module.exports = function() {
    var logLevel = -1;
    var levels = {
        'none'    : -1,
        'debug'   : 0,
        'info'    : 1,
        'notice'  : 2,
        'warning' : 3,
        'error'   : 4
    };

    function log(level, message) {
        if (logLevel <= levels[level]) {
            console.log(message);
        }
    }

    function setLogLevel(level) {
        logLevel = levels[level];
    }

    function getLogLevel() {
        return levels[logLevel];
    }

    return {
        log: log,
        getLogLevel: getLogLevel,
        setLogLevel: setLogLevel
    }
}