// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A MKD request asks the server to create a new directory. The MKD parameter is
 * an encoded pathname specifying the directory.
 *
 * If the server accepts MKD (required code 257), its response includes the
 * pathname of the directory, in the same format used for responses to PWD.
 *
 * A typical server accepts MKD with code 250 if the directory was successfully
 * created, or rejects MKD with code 550 if the creation failed.
 *
 * RFC 1123 requires that the server treat XMKD as a synonym for MKD.
 */
command.add('XMKD', 'XMKD <sp> pathname', function (pathname, output, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.mkdir(pathname, function (err) {
    if (err) {
      output.write(550, fs.errorMessage(err, pathname));
    } else {
      output.write(257, '"' + fs.encodePathname(pathname) + '" - Directory successfully created');
    }
  });
});
