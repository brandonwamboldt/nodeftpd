'use strict';

// Local dependencies
var command = require('../lib/command');
var channel = require('../lib/data-channel');
var fs      = require('../lib/fs');

/**
 * APPE is just like STOR except that, if the file already exists, the server
 * appends the client's data to the file.
 */
command.add('APPE', 'APPE <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);
  var stream       = fs.createWriteStream(absolutePath, { flags: 'a' });

  // Wait for the writable stream to be ready
  stream.on('open', function () {
    var success = channel.create(session, function (socket, done) {
      socket.pipe(stream);

      socket.on('end', function () {
        stream.end();
        done();
        commandChannel.write(226, 'Transfer Complete');
      });
    });

    if (!success) {
      commandChannel.write(425, 'Unable to build data connection: Invalid argument');
    } else {
      commandChannel.write(150, 'Opening ' + session.transferType.toUpperCase() + ' mode data connection for ' + pathname);
    }
  });

  // Catch any fs errors
  stream.on('error', function (err) {
    commandChannel.write(550, fs.errorMessage(err, pathname));
  });
});
