exports = module.exports = (function () {
    var os = require('os'),
        fs = require('fs'),
        _  = require('underscore');

    // Default configuration options
    var config = defaults = {
        'port'     : 21,
        'logLevel' : 'info',
        'motd'     : 'NodeFTPD 0.1a Server (' + os.hostname() + ')'
    };

    // Dynamically get the IP to listen on for the defaults
    function _getDefaultIp() {
        var interfaces = os.networkInterfaces();

        // Try using eth0 first (conventional default)
        if (typeof interfaces.eth0 != 'undefined') {
            defaults.listen = interfaces.eth0[0].address;
        } else {
            // Loop through non loopback addresses and use the first one
            for (var interface in interfaces) {
                if (interface != 'lo') {
                    defaults.listen = interfaces[interface][0].address;
                }
            }

            if (typeof defaults.listen == 'undefined') {
                defaults.listen = '127.0.0.1';
            }
        }
    }

    // Get a config variable
    function get(param) {
        return config[param];
    }

    function init() {
        _getDefaultIp();

        // Load /etc/nodeftpd.conf if it exists
        if (fs.existsSync('/etc/nodeftpd.conf')) {
            config = _.defaults(JSON.parse(fs.readFileSync('/etc/nodeftpd.conf')), defaults); 
        }
    }

    init();

    return {
        defaults : defaults,
        get      : get,
        config   : config
    }
});