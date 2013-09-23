'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 * A CDUP request asks the server to remove the last slash, and everything
 * following it, from the name prefix. If this produces an empty name prefix,
 * the new name prefix is a single slash. CDUP parameters are prohibited.
 *
 * The server may accept a CDUP request using code 200 or 250. (RFC 959 says
 * that code 200 is required; but it also says that CDUP uses the same codes as
 * CWD.) The server may reject a CDUP request using code 550.
 *
 * It is strongly recommended that clients avoid CDUP.
 *
 * RFC 1123 requires that the server treat XCUP as a synonym for CDUP.
 */
command.add('CDUP', 'CDUP (up one directory)', function (nil, commandChannel, session) {
  session.cwd = fs.toAbsolute('../', session.cwd);
  commandChannel.write(250, 'CDUP command successful.');
});
