// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A RNTO request asks the server to finish renaming a file. The RNTO parameter
 * is an encoded pathname specifying the new location of the file. RNTO must
 * come immediately after RNFR; otherwise the server may reject RNTO with code
 * 503.
 *
 * A typical server accepts RNTO with code 250 if the file was renamed
 * successfully, or rejects RNTO with code 550 or 553 otherwise.
 */
command.add('RNTO', 'RNTO <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  if (!session.rnfr) {
    commandChannel.write(503, 'Bad sequence of commands');
    return;
  }

  fs.rename(session.rnfr, absolutePath, function (err) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      commandChannel.write(250, 'Rename successful');
    }
  });
});
