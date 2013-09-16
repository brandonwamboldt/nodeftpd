var command = require('../lib/command');

command.add('MODE', 'Syntax: MODE is not implemented (always S)',
  { maxArguments: 1, minArguments: 1 },
  function (mode, output, session) {
    mode = mode.toUpperCase();

    if (mode === 'S') {
      output.write(200, 'Mode set to S');
    } else if (mode === 'A' || mode === 'C') {
      output.write(504, '\'MODE ' + mode + '\' unsupported transfer mode');
    } else {
      output.write(500, '\'MODE ' + mode + '\' unrecognized transfer mode');
    }
  }
);
