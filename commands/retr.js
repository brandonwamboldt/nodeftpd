var command = require('../lib/command')
  , fs      = require('fs')
  , channel = require('../lib/datachannel');

command.add('RETR', function (parameters, output, session) {
    var file = session.cwd + '/' + parameters;

    if (!fs.existsSync(file)) {
        output.write(550, parameters + ": No such file or directory");
    } else {
        fs.stat(file, function(err, stats) {
            var size = '';

            if (stats.size < 1024) {
                size = stats.size + ' bytes';
            } else if ((stats.size * 1024) < 1024) {
                size = stats.size + ' kilobytes';
            } else if ((stats.size * 1024 * 1024) < 1024) {
                size = stats.size + ' megabytes';
            } else if ((stats.size * 1024 * 1024 * 1024) < 1024) {
                size = stats.size + ' gigabytes';
            } else if ((stats.size * 1024 * 1024 * 1024 * 1024) < 1024) {
                size = stats.size + ' terabytes';
            }

            var success = channel.create(session, function(socket, done) {
                fs.readFile(file, function(err, data) {
                    socket.write(data);

                    output.write(226, "Transfer complete");

                    done();
                });
            });

            if (!success) {
                output.write(425, 'Unable to build data connection: Invalid argument'); 
            } else {
                output.write(150, "Opening " + session.transferType + " mode data connection for " + parameters + " (" + size + ")");
            }
        });
    }
});
