'use strict';

// Local dependencies
var command     = require('../lib/command');
var dataChannel = require('../lib/data-channel');

/**
 * A PORT request asks the server to use a different mechanism of creating a
 * data connection: the server makes a TCP connection to the client.
 *
 * The PORT request has a parameter in the form
 *
 *     h1,h2,h3,h4,p1,p2
 *
 * meaning that the client is listening for connections on TCP port p1*256+p2 at
 * IP address h1.h2.h3.h4. (The RFC 959 formal syntax does not allow any of
 * these numbers to be 0. The formal syntax is wrong.)
 *
 * The server normally accepts PORT with code 200. If the server was listening
 * for a connection, it stops, and drops any connections already made.
 *
 * The server does not connect to the client's port immediately. After the
 * client sends RETR and after the server sends its initial mark, the server
 * attempts to connect. It rejects the RETR request with code 425 if the
 * connection attempt fails; otherwise it proceeds normally.
 *
 * In theory, the client can send RETR without a preceding PORT or PASV. The
 * server is then supposed to connect to port 20 at the client's IP address. In
 * practice, however, servers refuse to do this.
 *
 * For security reasons, clients should never use PORT. However, some clients
 * still rely on PORT, and will give up on a file transfer if PORT is rejected.
 * It is recommended that servers continue to support PORT.
 */
command.add('PORT', 'PORT <sp> h1,h2,h3,h4,p1,p2', function (parameters, commandChannel, session) {
  // Close any open data channels
  dataChannel.close();

  // Set the FTP mode to Active
  session.mode = 'active';

  // Get the IP/port
  parameters                    = parameters.split(',');
  session.activeMode.clientIp   = parameters.slice(0, 4).join('.');
  session.activeMode.clientPort = (parseInt(parameters[4], 10) * 256) + parseInt(parameters[5], 10);

  // Open a data channel
  dataChannel.create(session, function () {
    commandChannel.write(200, 'PORT command successful, will transmit to ' + session.activeMode.clientIp + ':' + session.activeMode.clientPort);
  });
});
