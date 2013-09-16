var auth    = require('../lib/auth');
var command = require('../lib/command');

command.add('PASS', 'PASS <sp> password', function (password, output, session) {
  auth.authenticate(session.user, password, function (err, user) {
    if (err) {
      output.write(530, 'Login incorrect.');
      output.close();
    } else {
      session.authenticated = true;
      session.user          = user;
      session.chrootHome    = user.chroot;
      session.cwd           = user.home;
      output.write(230, 'Authenticated as ' + session.user);
    }
  });
});
