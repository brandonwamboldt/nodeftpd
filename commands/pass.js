var pam     = require('authenticate-pam');
var command = require('../lib/command');

command.add('PASS', 'PASS <sp> password', function (password, output, session) {
  pam.authenticate(session.user, password, function (err) {
    if (err) {
      output.write(530, 'Login incorrect.');
      output.close();
    } else {
      session.authenticated = true;
      output.write(230, 'Authenticated as ' + session.user);
    }
  });
});
