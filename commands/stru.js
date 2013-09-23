'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * STRU is obsolete. The server should accept STRU F (in any combination of
 * lowercase and uppercase) with code 200, and reject all other STRU attempts
 * with code 504.
 */
command.add('STRU', 'Syntax: STRU is not implemented (always F)', function (structure, commandChannel) {
  structure = structure.toUpperCase();

  if (structure === 'F') {
    commandChannel.write(200, 'Structure set to F');
  } else if (structure === 'R' || structure === 'P') {
    commandChannel.write(504, '\'STRU ' + structure + '\' unsupported structure type');
  } else {
    commandChannel.write(501, '\'STRU ' + structure + '\' unrecognized structure type');
  }
});
