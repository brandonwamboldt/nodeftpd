'use strict';

// Third party dependencies
var moment = require('moment');

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A MFMT request has two nonempty parameters, one giving a time value and the
 * second giving an encoded pathname. It asks the server to the set the mtime or
 * modification time of a file to the specified value.
 *
 * The server may accept a MFMT request using code 213:
 *
 *     MFMT 20131225000000 somefile.txt
 *     213 Modify=20131225000000; somefile.txt
 *
 * THe server may reject a MFMT request using code 550:
 *
 *     MFMT 20131225000000 nosuchfile.txt
 *     550 nosuchfile.txt: No such file or directory.
 *
 * Times are represented in GMT/UTC
 *
 * RFC Reference: draft-somers-ftp-mfxx-04
 */
command.add('MFMT', 'MFMT <sp> time-val <sp> pathname', function (args, commandChannel, session) {
  // Right number of arguments?
  if (args.split(' ').length < 2) {
    commandChannel.write(501, 'Invalid number of arguments');
    return;
  }

  // Parse the arguments
  var modificationTime = moment(args.split(' ', 2)[0], 'YYYYMMDDHHmmss');
  var pathname         = args.split(' ', 2)[1];
  var absolutePath     = fs.toAbsolute(pathname, session.cwd);

  // Valid modification time?
  if (!modificationTime.isValid()) {
    commandChannel.write(501, modificationTime + ': Invalid argument');
    return;
  }

  fs.utimes(absolutePath, modificationTime.unix(), modificationTime.unix(), function (err) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      commandChannel.write(213, 'Modify=' + modificationTime.format('YYYYMMDDHHmmss') + '; ' + pathname);
    }
  });
});
