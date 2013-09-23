'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * A NOOP request does nothing other than elicit a response from the server.
 * NOOP parameters are prohibited. A typical server accepts NOOP (required code
 * 200).
 */
command.add('NOOP', 'NOOP (no operation)', function (nil, commandChannel) {
  commandChannel.write(200, 'NOOP command successful');
});
