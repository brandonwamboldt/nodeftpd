var command = require('../lib/command');

command.add('USER', function(parameters, output, session) {
    session.user = parameters;
    output.write(331, 'Password required to access user account ' + parameters.trim());
});
