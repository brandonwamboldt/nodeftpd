'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A CWD request has a nonempty parameter giving an encoded pathname. It asks
 * the server to set the name prefix to this pathname, or to another pathname
 * that will have the same effect as this pathname if the filesystem does not
 * change.
 *
 * The server may accept a CWD request using code 200 or 250:
 *
 *     CWD /public
 *     250 Okay.
 *
 * (RFC 959 says that code 250 is required, but also gives examples of code 200.
 * I recommend 250.)
 *
 * The server may reject a CWD request using code 550:
 *
 *     CWD /pubilc
 *     550 /pubilc: No such file or directory.
 *
 * Most servers reject CWD requests unless the pathname refers to an accessible
 * directory. Some servers accept all CWD requests, without regard for what
 * directories are actually accessible.
 *
 * RFC 1123 requires that the server treat XCWD as a synonym for CWD.
 */
command.add('CWD', 'CWD <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.readdir(absolutePath, function (err) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      session.cwd = absolutePath;
      commandChannel.write(250, '"' + pathname + '" is the new working directory.');
    }
  });
});
