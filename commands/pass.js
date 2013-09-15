var command = require('../lib/command');

command.add('PASS', 'PASS <sp> password', function (parameters, output, session) {
  session.authenticated = true;
  output.write(230, 'Authenticated as ' + session.user);
});
