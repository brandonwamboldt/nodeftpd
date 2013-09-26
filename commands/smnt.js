'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * SMNT is obsolete. The server should accept any SMNT request with code 502.
 */
command.add('SMNT', 'SMNT is not implemented', function (nil, commandChannel) {
  commandChannel.write(502, 'SMNT command not implemented');
});
