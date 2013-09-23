'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * An RMD request asks the server to remove a directory. The RMD parameter is an
 * encoded pathname specifying the directory.
 *
 * A typical server accepts RMD with code 250 if the directory was successfully
 * removed, or rejects RMD with code 550 if the removal failed.
 */
command.add('RMD', 'RMD <sp> pathname', function (pathname, commandChannel, session) {
  var absoluetPath = fs.toAbsolute(pathname, session.cwd);

  fs.rmdir(absoluetPath, function (err) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      commandChannel.write(250, 'RMD command successful');
    }
  });
});
