var command = require('../lib/command')
  , fs  = require('fs');

command.add('CDUP', function (cd, output, session) {
    session.cwd = fs.realpathSync(session.cwd + '/../');

    output.write(250, 'CDUP command successful.');
});
