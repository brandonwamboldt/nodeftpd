'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A RNFR request asks the server to begin renaming a file. The RNFR parameter
 * is an encoded pathname specifying the file.
 *
 * A typical server accepts RNFR with code 350 if the file exists, or rejects
 * RNFR with code 450 or 550 otherwise.
 */
command.add('RNFR', 'RNFR <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  // Does the file exist?
  fs.exists(absolutePath, function (exists) {
    if (exists) {
      session.rnfr = absolutePath;
      commandChannel.write(350, 'File or directory exists, ready for destination name');
    } else {
      session.rnfr = false;
      commandChannel.write(550, '%s: No such file or directory', absolutePath);
    }
  });
});
