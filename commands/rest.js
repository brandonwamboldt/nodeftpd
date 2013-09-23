'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * The server keeps track of a start position for the client. The start position
 * is a nonnegative integer. At the beginning of the FTP connection, the start
 * position is 0.
 *
 * The start position changes the meaning of RETR for binary files as follows:
 * if the start position is n, the server will omit the first n bytes of the
 * data that it sends through the data connection. (RFC 959 specified a
 * completely different use of the start position; that use is obsolete.)
 *
 * Some servers also allow start positions for text files, with the same
 * semantics: omit the first n bytes of data transferred through the data
 * connection. However, clients cannot rely on this. Most existing servers skip
 * a different number of bytes for text files.
 *
 * A REST request sets the start position. REST has a parameter giving a number
 * as ASCII digits. If the server accepts the REST request (required code 350),
 * it has set the start position to that number. If the server rejects the REST
 * request, it has left the start position alone.
 *
 * The server will set the start position to 0 after a successful RETR, but
 * might not set the start position to 0 after an unsuccessful RETR, so the
 * client must be careful to send a new REST request before the next RETR. The
 * server might set the start position to 0 after responding to any request
 * other than REST, so the client must send REST immediately before RETR.
 *
 * Servers are not required to implement REST. However, many clients can take
 * advantage of REST to save time if a previous transfer was interrupted in the
 * middle. Clients beware: the file may have changed since the time of the
 * previous transfer.
 */
command.add('REST', 'REST <sp> byte-count', function (byteCount, commandChannel, session) {
  byteCount = parseInt(byteCount, 10);

  if (byteCount < 0) {
    commandChannel.write(501, 'REST requires a value greater than or equal to 0');
  } else {
    session.restByteCount = byteCount;

    commandChannel.write(350, 'Restarting at ' + byteCount + '. Send STORE or RETRIEVE to initiate transfer');
  }
});
