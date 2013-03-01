var command = require('../lib/command')
  , channel = require('../lib/datachannel')
  , fs      = require('fs');

command.add('STOR', function (path, output, session) {
    var success = channel.create(session, function(socket, done) {
        socket.on('data', function(data) {
            fs.writeFile(session.cwd + '/' + path, data, function(err) {
                output.write(226, "Transfer complete");

                done();
            });
        });
    });

    if (!success) {
        output.write(425, 'Unable to build data connection: Invalid argument'); 
    } else {
        output.write(150, "Opening " + session.transferType + " mode data connection for " + path);
    }
});
