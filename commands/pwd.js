var command = require('../lib/command');

command.add('PWD', function (type, output, session) {
  output.write(257, '"' + session.cwd + '"');
});
