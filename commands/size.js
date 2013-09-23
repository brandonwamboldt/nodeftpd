// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * The FTP command, SIZE OF FILE (SIZE), is used to obtain the transfer size of
 * a file from the server-FTP process.  This is the exact number of octets (8
 * bit bytes) that would be transmitted over the data connection should that
 * file be transmitted.  This value will change depending on the current
 * STRUcture, MODE, and TYPE of the data connection or of a data connection that
 * would be created were one created now.  Thus, the result of the SIZE command
 * is dependent on the currently established STRU, MODE, and TYPE parameters.
 *
 * Note that when the 213 response is issued, that is, when there is no error,
 * the format MUST be exactly as specified. Multi-line responses are not
 * permitted.
 *
 * SIZE is defined in RFC 3659 - Extensions to FTP
 */
command.add('SIZE', 'SIZE <sp> pathname', function (pathname, output, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.stat(pathname, function (err, stats) {
    if (err) {
      output.write(550, fs.errorMessage(err, pathname));
    } else {
      output.write(213, stats.size);
    }
  });
});
