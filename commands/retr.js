'use strict';

// Local dependencies
var fs          = require('../lib/fs');
var command     = require('../lib/command');
var dataChannel = require('../lib/data-channel');

/**
 * A RETR request asks the server to send the contents of a file over the data
 * connection already established by the client. The RETR parameter is an
 * encoded pathname of the file. The file is either a binary file or a text
 * file, depending on the most recent TYPE request.
 *
 * Normally the server responds with a mark using code 150. It then stops
 * accepting new connections, attempts to send the contents of the file over the
 * data connection, and closes the data connection. Finally it
 *
 *   - accepts the RETR request with code 226 if the entire file was
 *     successfully written to the server's TCP buffers;
 *   - rejects the RETR request with code 425 if no TCP connection was
 *     established;
 *   - rejects the RETR request with code 426 if the TCP connection was
 *     established but then broken by the client or by network failure; or
 *   - rejects the RETR request with code 451 or 551 if the server had trouble
 *     reading the file from disk.
 *
 * The server is obliged to close the data connection in each of these cases.
 * The client is not expected to look for a response from the server until the
 * client sees that the data connection is closed.
 *
 * The server may reject the RETR request without first responding with a mark.
 * In this case the server does not touch the data connection. RFC 959 allows
 * code 550 for file-does-not-exist, permission-denied, etc., and code 450 for
 * out-of-memory, disk-failure, etc.
 *
 * The client needs to be prepared for many different ways that RETR can fail:
 *
 *   1. After sending the RETR request, the client reads one response from the
 *      server. If this response is anything but a mark (for example, the server
 *      can't find the file, or doesn't have permission to open it, or is
 *      temporarily out of memory, or the server crashes and the connection is
 *      closed without a response, or the server is overloaded and the client
 *      times out before receiving a response), the client stops and reports
 *      temporary failure.
 *   2. After sending the RETR request and reading a mark, the client reads data
 *      from the data connection until FIN (end of file), or a TCP error (for
 *      example, TCP reset or network unreachable), or timeout. The client saves
 *      the data, remembers whether there was a FIN, and closes the data
 *      connection.
 *   3. After sending the RETR request, reading a mark, reading data from the
 *      data connection, and closing the data connection, the client reads
 *      another response from the server. If this response is acceptance and the
 *      data connection ended with FIN, the client knows that it has received
 *      the entire file from the server. Otherwise the client reports temporary
 *      failure; the file has (probably) been truncated.
 *
 * Note that code 226 from the server does not guarantee that the client has
 * received, or will receive, the entire file. The client must check for TCP
 * errors on the data connection.
 *
 * Some clients do not close the data connection until they receive the 226
 * response from the server. This behavior is permitted by RFC 959. (The intent,
 * now obsolete, was for clients to retrieve multiple files through one data
 * connection, with a self-delimiting encoding of each file. The server could
 * use 226 to say that it was closing the connection, or 250 to say that it
 * wasn't. The most obvious client implementation wouldn't close the connection
 * until it received 226.) However, I recommend that clients close the data
 * connection immediately after seeing the end of data. One server, wu-ftpd
 * 2.6.0, waits until the client closes the connection before it sends its 226
 * response; this screws up file transfers to clients that do not close the data
 * connection immediately. This also wastes a round-trip time for other clients.
 */
command.add('RETR', 'RETR <sp> pathname', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);
  var stream;

  // Are we resuming a file transfer?
  if (session.restByteCount === 0) {
    stream = fs.createReadStream(absolutePath, { flags: 'r' });
  } else {
    stream = fs.createReadStream(absolutePath, { flags: 'r', start: session.restByteCount });
    session.restByteCount = 0;
  }

  // Set the encoding
  if (!session.binary) {
    stream.setEncoding('ascii');
  }

  // Catch errors
  stream.on('error', function (err) {
    commandChannel.write(550, fs.errorMessage(err, pathname));
  });

  // Stat the file so we can get it's size
  fs.stat(absolutePath, function (err, stats) {
    var size = stats.size + ' bytes';

    if (dataChannel.isReady()) {
      commandChannel.write(150, 'Opening ' + session.transferType + ' mode data connection for ' + pathname + ' (' + size + ')');
    } else {
      commandChannel.write(425, 'Unable to build data connection: Invalid argument');
    }

    // Create a data channel to initiate the transfer
    dataChannel.onReady(function (socket, done) {
      stream.pipe(socket, { end: false });
      stream.on('end', function () {
        commandChannel.write(226, 'Transfer complete');

        done();
      });
    });
  });
});
