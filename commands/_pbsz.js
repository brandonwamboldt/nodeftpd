'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * The PBSZ subcommand defines largest buffer size to be used for application
 * level encoded data sent or received on the data connection. The syntax of
 * this subcommand is:
 *
 *   PBSZ value
 *
 * where value is an ASCII character string representing a decimal integer.
 *
 * Note: RFC2228 requires that the PBSZ subcommand be issued prior to the PROT
 * subcommand. However, TLS/SSL handles blocking of data, so '0' is the only
 * value accepted.
 */
command.add('PBSZ', 'PBSZ <sp> protection buffer size', function (bufferSize, commandChannel, session) {
  if (!session.isSecure) {
    commandChannel.write(500, 'PBSZ not understood');
  } else if (bufferSize === '0') {
    commandChannel.write(200, 'PBSZ 0 successful');
  } else {
    commandChannel.write(200, 'PBSZ=0 successful');
  }
});
