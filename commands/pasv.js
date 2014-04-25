'use strict';

// Local dependencies
var command     = require('../lib/command');
var dataChannel = require('../lib/data-channel');
var config      = require('../lib/config');

/**
 * A PASV request asks the server to accept a data connection on a new TCP port
 * selected by the server. PASV parameters are prohibited.
 *
 * The server normally accepts PASV with code 227. Its response is a single line
 * showing the IP address of the server and the TCP port number where the server
 * is accepting connections.
 *
 * Normally the client will connect to this TCP port, from the same IP address
 * that the client is using for the FTP connection, and then send a RETR
 * request. However, the client may send some other requests first, such as
 * REST. The server must continue to read and respond to requests while it
 * accepts connections. Most operating systems handle this automatically.
 *
 * If the client sends another PASV request, the server normally accepts the new
 * request with a new TCP port. It stops listening for connections on the old
 * port, and drops any connections already made.
 *
 * RFC 959 failed to specify details of the response format. It is recommended
 * that servers use the format
 *
 *     227 =h1,h2,h3,h4,p1,p2
 *
 * where the server's IP address is h1.h2.h3.h4 and the TCP port number is
 * p1*256+p2. The extra character before h1 is essential; otherwise old versions
 * of Netscape will lose the first digit of h1.
 *
 * Many servers put different strings before h1 and after p2. It is recommended
 * that clients use the following strategy to parse the response line: look for
 * the first digit after the initial space; look for the fourth comma after that
 * digit; read two (possibly negative) integers, separated by a comma; the TCP
 * port number is p1*256+p2, where p1 is the first integer modulo 256 and p2 is
 * the second integer modulo 256.
 *
 * All servers that support file transfers are required to support PASV. Many
 * clients rely on PASV, and will give up on a file transfer if PASV is
 * rejected.
 */
command.add('PASV', 'PASV (returns address/port)', function (nil, commandChannel, session) {
  // Close any open data channels
  dataChannel.close();

  // Set the data transfer mode
  session.mode = 'passive';

  // Free up any existing ports
  if (session.passiveMode.port !== 0) {
    process.send({ action: 'free_passive_port', port: session.passiveMode.port });
    session.passiveMode.port = 0;
  }

  // Send a request for the supervisor to issue us a port #
  process.send({ action: 'get_passive_port' });

  // Listen for the port # from the supervisor
  process.on('message', function setPassivePort (message) {
    if (message.action !== 'get_passive_port') {
      return;
    }

    // Remove the event listener so it doesn't fire again. We can't use .once
    // here because we may be sending more messages than get_passive_port.
    process.removeListener('message', setPassivePort);

    // Get the two parts of the port so it can be represented as a byte
    session.passiveMode.port = message.port;
    var port1 = Math.floor(message.port / 256);
    var port2 = message.port % 256;
    var port  = config.listen.replace(/\./g, ',') + ',' + port1 + ',' + port2;

    // Bind to the port we're using for passive mode
    dataChannel.create(session, function () {
      commandChannel.write(227, ' Entering passive mode (' + port + ')');
    });
  });
});
