// Local dependencies
var command = require('../lib/command');

/**
 * MODE is obsolete. The server should accept MODE S (in any combination of
 * lowercase and uppercase) with code 200, and reject all other MODE attempts
 * with code 504.
 */
command.add('MODE', 'Syntax: MODE is not implemented (always S)', function (mode, commandChannel) {
  mode = mode.toUpperCase();

  if (mode === 'S') {
    commandChannel.write(200, 'Mode set to S');
  } else if (mode === 'A' || mode === 'C') {
    commandChannel.write(504, '\'MODE ' + mode + '\' unsupported transfer mode');
  } else {
    commandChannel.write(500, '\'MODE ' + mode + '\' unrecognized transfer mode');
  }
});
