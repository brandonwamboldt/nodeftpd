var command = require('../lib/command');
var fs      = require('fs');

command.add('RNFR', 'RNFR <sp> pathname', rnfr, {maxArguments: 1, minArguments: 1});

/**
 * Used when renaming a file. Use this command to specify the file to be
 * renamed; follow it with an RNTO command to specify the new name for the file.
 * @param {!string} fromFilename
 * @param {!object} output
 * @param {!object} session
 */
function rnfr(fromFilename, output, session) {
  // If from name is a relative path, prepend the CWD to it to get an absolute
  // path
  if (fromFilename[0] !== '/') {
    if (session.cwd === '/') {
      fromFilename = session.cwd + fromFilename;
    } else {
      fromFilename = session.cwd + '/' + fromFilename;
    }
  }

  // Does the file exist?
  fs.exists(fromFilename, function (exists) {
    if (exists) {
      session.rnfr = fromFilename;
      output.write(350, 'File or directory exists, ready for destination name');
    } else {
      session.rnfr = false;
      output.write(550, '%s: No such file or directory', fromFilename);
    }
  });
}
