var command = require('../lib/command');
var fs      = require('../lib/fs');
var moment  = require('moment');

/**
 * Returns the last modified timestamp of the remote file as a decimal number.
 * @param {!string} pathname
 * @param {!object} output
 * @param {!object} session
 */
command.add('MDTM', 'MDTM <sp> pathname', { maxArguments: 1, minArguments: 1 }, function (pathname, output, session) {
  // If filename is a relative path, prepend the CWD to it to get an absolute
  // path
  if (pathname[0] !== '/') {
    if (session.cwd === '/') {
      pathname = session.cwd + pathname;
    } else {
      pathname = session.cwd + '/' + pathname;
    }
  }

  // Does the file exist?
  fs.stat(pathname, function (err, stats) {
    if (err) {
      // See `stat(2)` for a complete list of possible errors and their
      // meanings. We don't want to give too much information away, so
      // certain rare errors that have nothing to do with user input just
      // display a generic error (Like EIO, EFAULT, etc)
      switch (err.code) {
        case 'EACCES':
          output.write(550, '%s: Permission denied', pathname);
          break;
        case 'ELOOP':
          output.write(550, '%s: Too many symbolic links', pathname);
          break;
        case 'ENAMETOOLONG':
          output.write(550, '%s: Too long', pathname);
          break;
        case 'ENOENT':
          output.write(550, '%s: No such file or directory', pathname);
          break;
        default:
          output.write(550, '%s: An error occured', pathname);
      }
    } else {
      output.write(213, moment(stats.mtime).format('YYYYMMDDHHmmss'));
    }
  });
});
