var fs          = require('../lib/fs');
var command     = require('../lib/command');
var dataChannel = require('../lib/datachannel');

command.add('RETR', 'RETR <sp> pathname', function (pathname, output, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  // Are we resuming a file transfer?
  if (session.restByteCount == 0) {
    var stream = fs.createReadStream(absolutePath, { flags: 'r' });
  } else {
    var stream = fs.createReadStream(absolutePath, { flags: 'r', start: session.restByteCount });
    session.restByteCount = 0;
  }

  // Set the encoding
  if (!session.binary) {
    stream.setEncoding('ascii');
  }

  // Catch errors
  stream.on('error', function (err) {
    err = fs.errorMessage(err, path);
    output.write(550, err.msg);
  });

  // Stat the file so we can get it's size
  fs.stat(absolutePath, function (err, stats) {
    var size = stats.size + ' bytes';

    // Create a data channel to initiate the transfer
    var success = dataChannel.create(session, function (socket, done) {
      stream.pipe(socket, { end: false });
      stream.on('end', function () {
        output.write(226, 'Transfer complete');

        done();
      });
    });

    if (!success) {
      output.write(425, 'Unable to build data connection: Invalid argument');
    } else {
      output.write(150, 'Opening ' + session.transferType + ' mode data connection for ' + pathname + ' (' + size + ')');
    }
  });
});
