'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * A STAT request asks for human-readable information about the server's status.
 * The server normally accepts this request with code 211:
 *
 *     211- ftp.heaven.af.mil FTP server status:
 *          Version 6.00
 *          Connected to heaven.af.mil (10.1.2.3)
 *          Logged in anonymously
 *          TYPE: ASCII, FORM: Nonprint; STRUcture: File; transfer MODE: Stream
 *          No data connection
 *     211 End of status
 *
 * The response format varies widely from server to server. RFC 959 says that
 * the server should ``return general status information about the server FTP
 * process. This should include current values of all transfer parameters and
 * the status of connections.'' RFC 959 does not explain why this information is
 * supposed to be useful.
 *
 * A STAT request may include a parameter. In this case it asks for information
 * about a file identified by the parameter, similar to the information provided
 * by LIST. The server normally accepts this request with code 211, 212, or 213,
 * returning information in its response. According to RFC 959, information
 * about a regular file uses code 212, and information about a directory uses
 * code 213; in practice, however, most servers use code 211 in all cases, and
 * some servers use code 213 in all cases. If the file cannot be accessed, the
 * server rejects the request with code 450.
 *
 * Some servers (e.g., MultiNET FTP Server 4.1-91) ignore STAT parameters. Some
 * servers reject STAT parameters with code 504. Even when servers try to
 * support STAT, the output is even more difficult to parse than the output of
 * LIST.
 */
command.add('STAT', 'STAT [<sp> pathname]', function (pathname, commandChannel, session) {
  commandChannel.write(211, '-Status of \'NodeFTPD\'');
  commandChannel.write('Connected from ' + session.clientIp + ' (' + session.clientIp + ')');
  commandChannel.write('Logged in as ' + session.user.username);
  commandChannel.write('TYPE: ' + session.transferType + ', STRUcture: File, Mode: Stream');
  commandChannel.write('Total bytes transferred for session: ' + session.bytesTransferred);

  if (session.dataChannel) {
    commandChannel.write('Open data connection');
  } else {
    commandChannel.write('No data connection');
  }
  commandChannel.write(211, 'End of status');
});
