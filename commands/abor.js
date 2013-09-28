'use strict';

// Local dependencies
var command     = require('../lib/command');
var dataChannel = require('../lib/data-channel');
var config      = require('../lib/config');

/**
 * This command tells the server to abort the previous FTP service command and
 * any associated transfer of data. No action is to be taken if the previous
 * command has been completed (including data transfer). The control connection
 * is not to be closed by the server, but the data connection must be closed.
 *
 * Defined in RFC 959
 */
command.add('ABOR', 'ABOR (aborts any active data connections)', function (nil, commandChannel) {
  dataChannel.close();
  commandChannel.write(226, 'ABOR command succeeded');
});
