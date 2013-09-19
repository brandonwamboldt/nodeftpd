var command = require('../lib/command');
var channel = require('../lib/datachannel');
var fs      = require('../lib/fs');

command.add('STOR', 'STOR <sp> pathname', function (path, output, session) {
  var absolutePath = fs.toAbsolute(path, session.cwd);
  var stream       = fs.createWriteStream(absolutePath, { flags: 'w' });

  stream.on('open', function (fd) {
    var success = channel.create(session, function (socket, done) {
      socket.on('data', function (buffer) {
        stream.write(buffer);
      });

      socket.on('end', function (data) {
        stream.end();
        done();
        output.write(226, 'Transfer Complete');
      });
    });

    if (!success) {
      output.write(425, 'Unable to build data connection: Invalid argument');
    } else {
      output.write(150, 'Opening ' + session.transferType.toUpperCase() + ' mode data connection for ' + path);
    }
  });

  stream.on('error', function (err) {
    err = fs.errorMessage(err, path);
    output.write(err.status, err.msg);
  });
});
