// @todo replace with proper configuration
var config = {
    'port'     : 21,
    'listen'   : '192.168.221.148',
    'logLevel' : 'debug',
    'motd'     : 'NodeFTPD 0.1a Server (NodeFTPD)'
}

// Load dependencies
var app = require('./lib/ftpd')(config)
  , fs  = require('fs');

// Temp
fs.readdir('./commands', function(err, files) {
    for (var i = 0; i < files.length; i++) {
        require('./commands/' + files[i])(app);
    }
});
