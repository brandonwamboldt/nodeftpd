var command = require('../lib/command');

command.add('NOOP', 'NOOP (no operation)', function () {
  output.write(200, 'NOOP command successful');
});
