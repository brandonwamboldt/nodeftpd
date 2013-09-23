'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * A QUIT request asks the server to close the connection:
 *
 *     220 Features: a .
 *     QUIT
 *     221 Bye.
 *
 * QUIT parameters are prohibited. Some servers will reject any QUIT request
 * with a nonempty parameter.
 *
 * If the server accepts the QUIT request (required code 221), it then closes
 * the connection without reading further requests. The server also stops
 * listening for data connections and drops any data connections already
 * accepted.
 */
command.add('QUIT', 'QUIT (close control connection)', function (nil, commandChannel) {
  commandChannel.write(221, 'Goodbye');
  commandChannel.close();
});
