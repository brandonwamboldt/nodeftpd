'use strict';

// Local dependencies
var auth    = require('../lib/auth');
var command = require('../lib/command');
var config  = require('../lib/config');
var fs      = require('../lib/fs');

/**
 * A PASS request has a parameter called a password. The client must not send a
 * PASS request except immediately after a USER request.
 *
 * The server may accept PASS with code 230, meaning that permission to access
 * files under this username has been granted; or with code 202, meaning that
 * permission was already granted in response to USER; or with code 332, meaning
 * that permission might be granted after an ACCT request. The server may reject
 * PASS with code 503 if the previous request was not USER or with code 530 if
 * this username and password are jointly unacceptable.
 *
 * If USER is accepted with code 230, clients do not need to bother sending
 * PASS. However, pipelining clients will normally send PASS without waiting for
 * the USER response, and many of today's non-pipelining clients send PASS in
 * every case; so it is important for the server to accept PASS with code 202.
 */
command.add('PASS', 'PASS <sp> password', function (password, commandChannel, session) {
  auth.authenticate(session.user, password, function (err, user) {
    if (err) {
      commandChannel.write(530, 'Login incorrect.');
    } else {
      // Setup chroot
      fs.setChrootHome(user.chroot);

      // Store the user's info
      session.authenticated = true;
      session.user          = user;
      session.chrootHome    = user.chroot;
      session.cwd           = fs.unresolve(user.home);

      // Set the process UID
      process.setgroups(user.groups);
      process.setgid(user.gid);
      process.setuid(user.uid);

      // Status message
      commandChannel.write(230, 'Authenticated as ' + session.user.username + ' via the ' + config.auth.provider + ' auth provider');
    }
  });
});
