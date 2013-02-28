exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'USER') {
            session.user = parameters;
            output.write(331, 'Password required to access user account ' + parameters.trim());
        } 
    });
});