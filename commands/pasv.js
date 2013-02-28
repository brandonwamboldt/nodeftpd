exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, type, output, session) {
        if (command === 'PASV') {
            session.mode = 'passive';

            var ipport = app.server.address().address.replace(/\./g, ',') + ',111,111';

            output.write(227, 'Entering Passive Mode (' + ipport + ')');
        }
    });   
});