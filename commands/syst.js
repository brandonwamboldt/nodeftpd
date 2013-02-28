exports = module.exports = (function(app) {
    var os = require('os');

    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'SYST') {
            output.write(215, os.type() + ' Type: ' + session.type);
        } 
    });
});