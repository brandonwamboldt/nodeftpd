'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * A USER request has a parameter showing a username. Subsequent pathnames are
 * interpreted relative to this username.
 *
 * The server may accept USER with code 230, meaning that the client has
 * permission to access files under that username; or with code 331 or 332,
 * meaning that permission might be granted after a PASS request.
 *
 * In theory, the server may reject USER with code 530, meaning that the
 * username is unacceptable. In practice, the server does not check the username
 * until after a PASS request.
 *
 * Some clients incorrectly treat 230 the same way as 530.
 *
 * Some servers can accept several USER requests in one FTP connection; some
 * can't. It is recommended that clients make a new connection instead.
 */
command.add('USER', 'USER <sp> username', function (username, commandChannel, session) {
  session.user = username;
  commandChannel.write(331, 'Password required to access user account ' + username.trim());
});
