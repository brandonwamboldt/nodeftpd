'use strict';

// Third party dependencies
var moment = require('moment');

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A MDTM request asks for the last modified time of a file or directory.
 *
 * RFC Reference: rfc3659 - Extensions to FTP
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
