'use strict';

// Local dependencies
var command = require('../lib/command');
var channel = require('../lib/data-channel');
var fs      = require('../lib/fs');

/**
 * A STOR request asks the server to read the contents of a file from the data
 * connection already established by the client. The STOR parameter is an
 * encoded pathname of the file. The file is either a binary file or a text
 * file, depending on the most recent TYPE request.
 *
 * If the server is willing to create a new file under that name, or replace an
 * existing file under that name, it responds with a mark using code 150. It
 * then stops accepting new connections, attempts to read the contents of the
 * file from the data connection, and closes the data connection. Finally it
 *
 *   - accepts the STOR request with code 226 if the entire file was
 *     successfully received and stored;
 *   - rejects the STOR request with code 425 if no TCP connection was
 *     established;
 *   - rejects the STOR request with code 426 if the TCP connection was
 *     established but then broken by the client or by network failure; or
 *   - rejects the STOR request with code 451, 452, or 552 if the server had
 *     trouble saving the file to disk.
 *
 * The server may reject the STOR request (code 450, 452, or 553) without first
 * responding with a mark. In this case the server does not touch the data
 * connection.
 *
 * Some servers allow REST immediately before STOR for binary files, if a
 * previous STOR for the same file transmitted at least the number of bytes
 * given by the start position.
 */
command.add('STOR', 'STOR <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);
  var stream;

  // Are we resuming a failed upload (the client issued a REST command)
  if (session.restByteCount === 0) {
    stream = fs.createWriteStream(absolutePath, { flags: 'w' });
  } else {
    stream = fs.createWriteStream(absolutePath, { flags: 'a+', start: session.restByteCount });
    session.restByteCount = 0;
  }

  // Wait for the writable stream to be ready
  stream.on('open', function () {
    var success = channel.onReady(function (socket, done) {
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
