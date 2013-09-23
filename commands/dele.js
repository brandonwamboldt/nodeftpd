'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A DELE request asks the server to remove a regular file. The DELE parameter
 * is an encoded pathname specifying the file.
 *
 * A typical server accepts DELE with code 250 if the file was successfully
 * removed, or rejects DELE with code 450 or 550 if the removal failed.
 */
command.add('DELE', 'DELETE <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.unlink(absolutePath, function (err) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      commandChannel.write(250, 'DELE command successful');
    }
  });
});
