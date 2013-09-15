var command = require('../lib/command');

command.add('NOOP', 'NOOP (no operation)', function (parameters, output, session) {
  output.write(200, 'NOOP command successful');
});
