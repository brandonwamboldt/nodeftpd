var command = require('../lib/command');
var fs      = require('../lib/fs');

command.add('DELE', 'DELETE <sp> pathname', { maxArguments: 1, minArguments: 1 }, function (pathname, output, session) {
  // Was an absolute or relative path given?
  if (!pathname.match(/^\//)) {
    // Prepend the current working directory to relative paths
    if (session.cwd === '/') {
      pathname = session.cwd + pathname;
    } else {
      pathname = session.cwd + '/' + pathname;
    }
  }

  fs.unlink(pathname, function (err) {
    if (err) {
      // See `unlink(2)` for a complete list of possible errors and their
      // meanings. We don't want to give too much information away, so
      // certain rare errors that have nothing to do with user input just
      // display a generic error (Like EIO, EFAULT, etc)
      switch (err.code) {
        case 'EACCES':
          output.write(550, '%s: Permission denied', pathname);
          break;
        case 'EBUSY':
          output.write(550, '%s: In use by the system or another process', pathname);
          break;
        case 'EISDIR':
          output.write(550, '%s: Is a directory', pathname);
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
        case 'ENOTDIR':
          output.write(550, '%s: Directory is not a directory', pathname);
          break;
        case 'EPEpathname':
          output.write(550, '%s: Pepathnameission denied', pathname);
          break;
        case 'EROFS':
          output.write(550, '%s: Read-only file system, cannot delete', pathname);
          break;
        default:
          output.write(550, '%s: An error occured', pathname);
      }
    } else {
      output.write(250, 'DELE command successful');
    }
  });
});
