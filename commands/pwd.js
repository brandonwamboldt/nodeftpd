exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, type, output, session) {
        if (command === 'PWD') {
            output.write(257, '"' + session.cwd + '"');
        }
    });   
});