var command = require('../lib/command');
var fs      = require('fs');

command.add('RNTO', 'RNTO <sp> pathname', rnto, {maxArguments: 1, minArguments: 1});

/**
 * Used when renaming a file. After sending an RNFR command to specify the file
 * to rename, send this command to specify the new name for the file.
 * @param {!string} toFilename
 * @param {!object} output
 * @param {!object} session
 */
function rnto(toFilename, output, session) {
  // If to name is a relative path, prepend the CWD to it to get an absolute
  // path
  if (toFilename[0] !== '/') {
    if (session.cwd === '/') {
      toFilename = session.cwd + toFilename;
    } else {
      toFilename = session.cwd + '/' + toFilename;
    }
  }

  // Did the user issue an RNFR first?
  if (!session.rnfr) {
    output.write(503, 'Bad eqeuence of commands');
    return;
  }

  // Move the file
  fs.rename(session.rnfr, toFilename, function (err) {
    if (err) {
      // See `unlink(2)` for a complete list of possible errors and their
      // meanings. We don't want to give too much information away, so
      // certain rare errors that have nothing to do with user input just
      // display a generic error (Like EIO, EFAULT, etc)
      switch (err.code) {
        case 'EACCES':
          output.write(550, '%s: Permission denied', toFilename);
          break;
        case 'EBUSY':
          output.write(550, '%s: In use by the system or another process', toFilename);
          break;
        case 'EISDIR':
          output.write(550, '%s: Is a directory', toFilename);
          break;
        case 'ELOOP':
          output.write(550, '%s: Too many symbolic links', toFilename);
          break;
        case 'ENAMETOOLONG':
          output.write(550, '%s: Too long', toFilename);
          break;
        case 'ENOENT':
          output.write(550, '%s: No such file or directory', toFilename);
          break;
        case 'ENOTDIR':
          output.write(550, '%s: Directory is not a directory', toFilename);
          break;
        case 'EPERM':
          output.write(550, '%s: Permission denied', toFilename);
          break;
        case 'EROFS':
          output.write(550, '%s: Read-only file system, cannot delete', toFilename);
          break;
        default:
          output.write(550, '%s: An error occured', toFilename);
      }
    } else {
      output.write(250, 'Rename successful');
    }
  });
}
