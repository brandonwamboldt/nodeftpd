var os = require('os');

// Load dependencies
var config = require('./lib/config')()
  , app    = require('./lib/ftpd')(config)
  , fs     = require('fs');

// Load command modules
fs.readdir('./commands', function(err, files) {
    for (var i = 0; i < files.length; i++) {
        require('./commands/' + files[i])(app);
    }
});
