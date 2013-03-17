var command = require('../lib/command')
  , fs      = require('fs');

command.add('DELE', dele, {maxArguments: 1, minArguments: 1});

function dele(rm, output, session) {
    // Was an absolute or relative path given?
    if (!rm.match(/^\//)) {
        // Prepend the current working directory to relative paths
        if (session.cwd == '/') {
            rm = session.cwd + rm;
        } else {
            rm = session.cwd + '/' + rm;
        }
    }

    fs.unlink(rm, function(err) {
        if (err) {
            // See `unlink(2)` for a complete list of possible errors and their
            // meanings. We don't want to give too much information away, so
            // certain rare errors that have nothing to do with user input just
            // display a generic error (Like EIO, EFAULT, etc)
            switch (err.code) {
                case 'EACCES':
                    output.write(550, '%s: Permission denied', rm)
                    break
                case 'EBUSY':
                    output.write(550, '%s: In use by the system or another process', rm)
                    break
                case 'EISDIR':
                    output.write(550, '%s: Is a directory', rm)
                    break
                case 'ELOOP':
                    output.write(550, '%s: Too many symbolic links', rm)
                    break
                case 'ENAMETOOLONG':
                    output.write(550, '%s: Too long', rm)
                    break
                case 'ENOENT':
                    output.write(550, '%s: No such file or directory', rm)
                    break
                case 'ENOTDIR':
                    output.write(550, '%s: Directory is not a directory', rm)
                    break
                case 'EPERM':
                    output.write(550, '%s: Permission denied', rm)
                    break
                case 'EROFS':
                    output.write(550, '%s: Read-only file system, cannot delete', rm)
                    break
                default:
                    output.write(550, '%s: An error occured', rm)
            }
        } else {
            output.write(250, 'DELE command successful');
        }
    });
}
