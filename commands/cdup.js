exports = module.exports = (function(app) {
    var fs = require('fs');
    
    app.server.on('ftp:command_received', function(command, cd, output, session) {
        if (command === 'CDUP') {
            session.cwd = fs.realpathSync(session.cwd + '/../');

            output.write(250, 'CDUP command successful.');
        } 
    });
});