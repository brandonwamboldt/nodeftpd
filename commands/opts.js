exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'OPTS') {
            var option = parameters.match(/^([^ ]+)/)[1];
            var value  = parameters.match(/^[^ ]+ (.*)/)[1];
            session.parameters[option] = value;

            output.write(200, option + ' set to ' + value.toLowerCase());
        }
    });
});