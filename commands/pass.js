var auth    = require('../lib/auth');
var command = require('../lib/command');
var config  = require('../lib/config');
var fs      = require('../lib/fs');

command.add('PASS', 'PASS <sp> password', function (password, output, session) {
  auth.authenticate(session.user, password, function (err, user) {
    if (err) {
      output.write(530, 'Login incorrect.');
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
      output.write(230, 'Authenticated as ' + session.user.username + ' via the ' + config.auth.provider + ' auth provider');
    }
  });
});
