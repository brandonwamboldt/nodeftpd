var command = require('../lib/command');

command.add('NOOP', function (parameters, output, session) {
  output.write(200, 'NOOP command successful');
});
