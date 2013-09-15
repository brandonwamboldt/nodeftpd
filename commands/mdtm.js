var command = require('../lib/command');
var fs      = require('fs');
var moment  = require('moment');

command.add('MDTM', 'MDTM <sp> pathname', mdtm, {maxArguments: 1, minArguments: 1});

/**
 * Returns the last modified timestamp of the remote file as a decimal number.
 * @param {!string} remoteFilename
 * @param {!object} output
 * @param {!object} session
 */
function mdtm(remoteFilename, output, session) {
  // If filename is a relative path, prepend the CWD to it to get an absolute
  // path
  if (remoteFilename[0] !== '/') {
    if (session.cwd === '/') {
      remoteFilename = session.cwd + remoteFilename;
    } else {
      remoteFilename = session.cwd + '/' + remoteFilename;
    }
  }

  // Does the file exist?
  fs.stat(remoteFilename, function (err, stats) {
    if (err) {
      // See `stat(2)` for a complete list of possible errors and their
      // meanings. We don't want to give too much information away, so
      // certain rare errors that have nothing to do with user input just
      // display a generic error (Like EIO, EFAULT, etc)
      switch (err.code) {
        case 'EACCES':
          output.write(550, '%s: Permission denied', remoteFilename);
          break;
        case 'ELOOP':
          output.write(550, '%s: Too many symbolic links', remoteFilename);
          break;
        case 'ENAMETOOLONG':
          output.write(550, '%s: Too long', remoteFilename);
          break;
        case 'ENOENT':
          output.write(550, '%s: No such file or directory', remoteFilename);
          break;
        default:
          output.write(550, '%s: An error occured', remoteFilename);
      }
    } else {
      output.write(213, moment(stats.mtime).format('YYYYMMDDHHmmss'));
    }
  });
}
