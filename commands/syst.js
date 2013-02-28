exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'SYST') {
            output.write(215, 'UNIX Type: ' + session.type);
        } 
    });
});