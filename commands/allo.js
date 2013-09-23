// Local dependencies
var command = require('../lib/command');

/**
 * ALLO is obsolete. The server should accept any ALLO request with code 202.
 */
command.add('ALLO', 'ALLO is not implemented (ignored)', function (params, commandChannel) {
  if (params.match(/^[0-9]+( R [0-9])?$/i)) {
    commandChannel.write(200, 'ALLO command successful');
  } else if (params) {
    commandChannel.write(504, params + ': invalid ALLO argument');
  } else {
    commandChannel.write(504, '\'ALLO\' not understood');
  }
});
