// Third party dependencies
var yaml   = require('js-yaml');
var os     = require('os');
var fs     = require('fs');
var _      = require('lodash');

// Get package.json to get package info
var pkg = require('../package.json');

// Dynamically get the IP to listen on for the defaults
var interfaces = os.networkInterfaces();
var defaultInterface = '127.0.0.1';

// Try using eth0 first (conventional default)
if (typeof interfaces.eth0 !== 'undefined') {
  defaultInterface = interfaces.eth0[0].address;
} else {
  // Loop through non loopback addresses and use the first one
  for (var interface in interfaces) {
    if (interface !== 'lo') {
      defaultInterface = interfaces[interface][0].address;
    }
  }
}

// Used to interpolate config vars
var interpolateConfigVars = function (str) {
  if (typeof str === 'string') {
    // Special
    str = str.replace(/%default_ip%/g, defaultInterface);

    // OS variables
    str = str.replace(/%os\.endianness%/g, os.endianness());
    str = str.replace(/%os\.hostname%/g, os.hostname());
    str = str.replace(/%os\.tmpdir%/g, os.tmpdir());
    str = str.replace(/%os\.type%/g, os.type());
    str = str.replace(/%os\.platform%/g, os.platform());
    str = str.replace(/%os\.arch%/g, os.arch());
    str = str.replace(/%os\.release%/g, os.release());
    str = str.replace(/%os\.uptime%/g, os.uptime());
    str = str.replace(/%os\.loadavg%/g, os.loadavg().join(' '));
    str = str.replace(/%os\.totalmem%/g, os.totalmem());
    str = str.replace(/%os\.freemem%/g, os.freemem());

    // Package variables
    str = str.replace(/%pkg\.name%/g, pkg.name);
    str = str.replace(/%pkg\.version%/g, pkg.version);
  } else if (typeof str === 'object') {
    for (var prop in str) {
      str[prop] = interpolateConfigVars(str[prop]);
    }
  }

  return str;
};

// Load /etc/nodeftpd.yml if it exists
if (fs.existsSync('/etc/nodeftpd.yml')) {
  var userConfig    = require('/etc/nodeftpd.yml');
  var defaultConfig = require('../config.yml');
  module.exports    = _.merge(userConfig, defaultConfig, function (systemProp, defaultProp) {
    systemProp  = interpolateConfigVars(systemProp);
    defaultProp = interpolateConfigVars(defaultProp);

    if (typeof systemProp === 'object') {
      return _.defaults(systemProp, defaultProp);
    } else {
      return systemProp || defaultProp;
    }
  });
} else {
  module.exports = interpolateConfigVars(require('../config.yml'));
}
