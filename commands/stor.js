var command = require('../lib/command');
var channel = require('../lib/datachannel');
var fs      = require('fs');

command.add('STOR', 'STOR <sp> pathname', function (path, output, session) {
  var success = channel.create(session, function (socket, done) {
    // @todo Write to file as it is received to avoid memory issues
    var buffers = [];
    var bytes   = 0;
    var offset  = 0;

    socket.on('data', function (buffer) {
      buffers.push(buffer);
      bytes += buffer.length;
    });

    socket.on('end', function (data) {
      fs.open(session.cwd + '/' + path, 'w', function (err, fd) {
        for (var i in buffers) {
          fs.writeSync(fd, buffers[i], 0, buffers[i].length, offset);
          offset += buffers[i].length;
        }

        done();

        output.write(226, 'Transfer Complete');
      });
    });
  });

  if (!success) {
    output.write(425, 'Unable to build data connection: Invalid argument');
  } else {
    output.write(150, 'Opening ' + session.transferType.toUpperCase() + ' mode data connection for ' + path);
  }
});
