var command = require('../lib/command');

/**
 * The server keeps track of a binary flag for the client. At any moment, the
 * binary flag is either on or off. At the beginning of the FTP connection, the
 * binary flag is off.
 *
 * While the binary flag is on, all RETR, STOR, APPE, and STOU requests are for
 * binary files. While the binary flag is off, all RETR, STOR, APPE, and STOU
 * requests are for text files. The binary flag has no effect on NLST and LIST.
 *
 * A TYPE request controls the binary flag. It has a parameter. There are four
 * possibilities for the parameter:
 *
 *   A: Turn the binary flag off.
 *   A N: Turn the binary flag off.
 *   I: Turn the binary flag on.
 *   L 8: Turn the binary flag on.
 *
 * The server accepts the TYPE request with code 200.
 *
 * RFC 959 requires that servers accept parameters in any combination of l
 * owercase and uppercase, but I recommend that clients always use uppercase.
 * RFC 959 also defined several more TYPE parameters, all of which are now
 * obsolete.
 */
command.add('TYPE', 'TYPE <sp> type-code (A, I, L 7, L 8)', function (type, output, session) {
  type = type.toUpperCase();

  // Check for A or A N, which indicate ASCII mode transfers.
  if (type.match(/^A[0-9]?$/)) {
    output.write(200, 'Switching to ASCII mode.');
    session.binary       = false;
    session.type         = 'A';
    session.transferType = 'ASCII';
  } else if (type.match(/^L[0-9]?$/) || type === 'I') {
    output.write(200, 'Switching to Binary mode.');
    session.binary       = true;
    session.type         = 'I';
    session.transferType = 'binary';
  } else {
    output.write(500, 'Unrecognized TYPE command.');
  }
});
