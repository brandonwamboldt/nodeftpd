'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * The PROT subcommand defines the protection used for FTP data connections
 * (which are used to transmit directory listings and file data). The syntax of
 * this subcommand is:
 *
 *   PROT [ C | P ]
 *
 * Parameter values:
 *
 *   - C : Clear. The data connection carries "raw data" of the file transfer
 *         with no security applied.
 *   - P : Private. The data connection will use TLS/SSL, which provides
 *         Integrity and Confidentiality protection.
 */
command.add('PROT', 'PROT <sp> protection code', function (protectionCode, commandChannel, session) {
  if (!session.isSecure) {
    commandChannel.write(500, 'PROT not understood');
  } else if (protectionCode === 'P') {
    commandChannel.write(200, 'Protection set to Private');
    session.protectionCode = 'P';
  } else if (protectionCode === 'C') {
    commandChannel.write(200, 'Protection set to Clear');
    session.protectionCode = 'C';
  } else {
    commandChannel.write(504, 'PROT ' + protectionCode + ' unsupported');
  }
});
