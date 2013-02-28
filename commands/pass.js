exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'PASS') {
            session.authenticated = true;
            output.write(230, 'Authenticated as ' + session.user);
        } 
    });
});