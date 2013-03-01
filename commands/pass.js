var command = require('../lib/command');

command.add('PASS', function (parameters, output, session) {
    session.authenticated = true;
    output.write(230, 'Authenticated as ' + session.user);
});
