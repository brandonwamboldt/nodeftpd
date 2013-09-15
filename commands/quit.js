var command = require('../lib/command');
var os      = require('os');

command.add('QUIT', function (parameters, output, session) {
  output.write(221, 'Goodbye');
  output.close();
});
