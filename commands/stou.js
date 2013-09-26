'use strict';

// Local dependencies
var command = require('../lib/command');
var channel = require('../lib/data-channel');
var fs      = require('../lib/fs');

// Third party dependencies
var tmp  = require('tmp');
var path = require('path');

/**
 * STOU is just like STOR except that it asks the server to create a file under
 * a new pathname selected by the server. The STOU parameter is optional; if it
 * is supplied, it is a suggested pathname, which the server will ignore if
 * there is already a file with that pathname. (RFC 959 prohibited STOU
 * parameters, but this prohibition is obsolete.)
 *
 * If the server accepts STOU, it provides the pathname in a human-readable
 * format in the text of its response.
 */
command.add('STOU', 'STOU [<sp> pathname]', function (pathname, commandChannel, session) {
  var next = function (err, absolutePath) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, absolutePath));
    }

    var stream;

    // Get the name of the new file, relative to the chroot jail
    absolutePath = fs.unresolve(absolutePath);

    // Are we resuming a failed upload (the client issued a REST command)
    if (session.restByteCount === 0) {
      stream = fs.createWriteStream(absolutePath, { flags: 'w' });
    } else {
      stream = fs.createWriteStream(absolutePath, { flags: 'a+', start: session.restByteCount });
      session.restByteCount = 0;
    }

    // Wait for the writable stream to be ready
    stream.on('open', function () {
      var success = channel.create(session, function (socket, done) {
        socket.pipe(stream);

        socket.on('end', function () {
          stream.end();
          done();
          commandChannel.write(226, 'Transfer Complete, created file: ' + path.basename(absolutePath));
        });
      });

      if (!success) {
        commandChannel.write(425, 'Unable to build data connection: Invalid argument');
      } else {
        commandChannel.write(150, 'Opening ' + session.transferType.toUpperCase() + ' mode data connection');
      }
    });

    // Catch any fs errors
    stream.on('error', function (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    });
  };

  // Generate a unique file name, but first check if a pathname was provided and
  // if it exists or not (if it exists, create a random name).
  if (pathname) {
    var absolutePath = fs.toAbsolute(pathname, session.cwd);

    fs.exists(absolutePath, function (exists) {
      if (exists) {
        var fileExtension = absolutePath.match(/(\.[a-z0-9]+)$/i) ? absolutePath.match(/(\.[a-z0-9]+)$/i)[1] : '';

        tmp.tmpName({ dir: session.cwd, prefix: '', postfix: fileExtension }, next);
      } else {
        next(null, fs.resolve(absolutePath));
      }
    });
  } else {
    tmp.tmpName({ dir: fs.resolve(session.cwd), prefix: '' }, next);
  }
});
