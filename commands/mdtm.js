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
command.add('MDTM', 'MDTM <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.stat(absolutePath, function (err, stats) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      commandChannel.write(213, moment(stats.mtime).format('YYYYMMDDHHmmss'));
    }
  });
});
