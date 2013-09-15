var command = require('../lib/command');

command.add('PWD', 'PWD (returns current working directory)', function (type, output, session) {
  output.write(257, '"' + session.cwd + '"');
});
