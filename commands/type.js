exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, type, output, session) {
        if (command === 'TYPE') {
            var typeChar   = type.substr(0, 1);
            var secondChar = type.substr(1, 1);

            if (type.length > 2) {
                output.write(500, 'Unrecognized TYPE command.');
            } else if (typeChar == 'A') {
                if (secondChar != '') {
                    output.write(500, 'Unrecognized TYPE command.');
                } else {
                    output.write(200, 'Switching to ASCII mode.');
                }
            } else if (typeChar == 'I') {
                output.write(200, 'Switching to Binary mode.');
            } else if (typeChar == 'L') {
                if (!secondChar || secondChar < 0) {
                    output.write(500, 'Unrecognized TYPE command.');
                } else {
                    output.write(200, 'Switching to Binary mode.');
                }
            } else {
                output.write(500, 'Unrecognized TYPE command.');
            }
        }
    });
});