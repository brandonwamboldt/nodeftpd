'use strict';

// Third party dependencies
var moment = require('moment');

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * Returns the last modified timestamp of the remote file as a decimal number.
 * @param {!string} pathname
 * @param {!object} commandChannel
 * @param {!object} session
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
