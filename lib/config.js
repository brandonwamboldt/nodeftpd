// Module Dependencies
var os     = require('os');
var fs     = require('fs');
var _      = require('lodash');
var config = exports;

// Expose the configuration
var defaults = exports = module.exports = {
  port: 21,
  log_level: 'info',
  passive_port_range: '40000-60000',
  motd: 'NodeFTPD 0.1a Server (' + os.hostname() + ')',
  auth: {
    provider: 'pam',
    chroot: '~'
  }
};

// Dynamically get the IP to listen on for the defaults
var interfaces = os.networkInterfaces();

// Try using eth0 first (conventional default)
if (typeof interfaces.eth0 !== 'undefined') {
  defaults.listen = interfaces.eth0[0].address;
} else {
  // Loop through non loopback addresses and use the first one
  for (var interface in interfaces) {
    if (interface !== 'lo') {
      defaults.listen = interfaces[interface][0].address;
    }
  }

  if (typeof defaults.listen === 'undefined') {
    defaults.listen = '127.0.0.1';
  }
}

// Load /etc/nodeftpd.conf if it exists
if (fs.existsSync('/etc/nodeftpd.conf')) {
  var defaultsDeep = _.partialRight(_.merge, _.defaults);
  module.exports = defaultsDeep(JSON.parse(fs.readFileSync('/etc/nodeftpd.conf')), module.exports);
}

