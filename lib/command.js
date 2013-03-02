var app      = require('../lib/ftpd'),
    commands = [];

exports.add = function(command, callback) {
    commands.push({command: command, callback: callback});
}

app.server.on('ftp:commandReceived', function (clientCommand, output, session) {
    var parameters, handled = false;

    for (command in commands) {
        command = commands[command];

        if (clientCommand.toUpperCase().indexOf(command.command.toUpperCase()) === 0) {
            parameters = clientCommand.substr(command.command.toUpperCase().length).trim();

            handled = true;
            command.callback(parameters, output, session);
        }
    }

    if (!handled) {
        output.write(500, clientCommand.trim() + ' not understood');
    }
});