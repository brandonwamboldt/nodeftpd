// Load dependencies
var app = require('./lib/ftpd')
  , fs  = require('fs');

app.start();

// Load command modules
fs.readdir('./commands', function(err, files) {
    for (var i = 0; i < files.length; i++) {
        require('./commands/' + files[i]);
    }
});
