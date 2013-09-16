var command = require('../lib/command');
var fs      = require('../lib/fs');

command.add('CDUP', 'CDUP (up one directory)', function (cd, output, session) {
  session.cwd = fs.unresolve(fs.realpathSync(session.cwd + '/../'));
  output.write(250, 'CDUP command successful.');
});
