// Module Dependencies
var os     = require('os')
  , fs     = require('fs')
  , _      = require('lodash')
  , config = exports;

// Expose the configuration
config.defaults = config.options = {
    'port'             : 21,
    'logLevel'         : 'info',
    'passivePortRange' : '40000-60000',
    'motd'             : 'NodeFTPD 0.1a Server (' + os.hostname() + ')'
};

// Get a config variable
config.get = function (option) {
    return config.options[option];
}

// Dynamically get the IP to listen on for the defaults
var interfaces = os.networkInterfaces();

// Try using eth0 first (conventional default)
if (typeof interfaces.eth0 != 'undefined') {
    config.defaults.listen = interfaces.eth0[0].address;
} else {
    // Loop through non loopback addresses and use the first one
    for (var interface in interfaces) {
        if (interface != 'lo') {
            config.defaults.listen = interfaces[interface][0].address;
        }
    }

    if (typeof config.defaults.listen == 'undefined') {
        config.defaults.listen = '127.0.0.1';
    }
}

// Load /etc/nodeftpd.conf if it exists
if (fs.existsSync('/etc/nodeftpd.conf')) {
    config.options = _.defaults(JSON.parse(fs.readFileSync('/etc/nodeftpd.conf')), config.defaults);
}
