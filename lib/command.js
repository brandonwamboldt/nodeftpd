var app      = require('../lib/ftpd'),
    commands = [];

exports.add = function(command, callback) {
    commands.push({command: command, callback: callback});
}

app.server.on('ftp:command_received', function (clientCommand, type, output, session) {
    var handled = false;

    for (command in commands) {
        command = commands[command];

        if (command.command.toUpperCase() == clientCommand.toUpperCase()) {
            handled = true;
            command.callback(type, output, session);
            break;
        }
    }

    if (!handled) {
        output.write(500, clientCommand + ' not understood');
    }
});