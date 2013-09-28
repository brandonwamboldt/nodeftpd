global.processType = 'child';

// Module Dependencies
var sessionManager = require('../lib/session-manager');
var commandChannel = require('../lib/command-channel');
var config         = require('../lib/config');
var logger         = require('../lib/logger');
var net            = require('net');
var fs             = require('fs');
var eventQueue     = [];

// They attach a listener to the process uncaughtException event so we need to
// include the module now so our uncaughtException handler happens after
require('tmp');

// New child process awaiting connections
logger.log('info', '<cyan>[Process Manager]</cyan> Child process with PID %d listening', process.pid);

// Load command modules right away so there ready when a new connection is
// established
fs.readdir(__dirname + '/../commands', function (err, files) {
  for (var i = 0; i < files.length; i++) {
    require(__dirname + '/../commands/' + files[i]);
  }
});

// Load authentication mechanisms right away so there ready when a new
// connection is established
fs.readdir(__dirname + '/../auth', function (err, files) {
  for (var i = 0; i < files.length; i++) {
    require(__dirname + '/../auth/' + files[i]);
  }
});

// Allow code to hook into the socket.on event before a socket exists using a
// queue based proxy
exports.on = function () {
  eventQueue.push(arguments);

  if (exports.socket) {
    exports.socket.on.apply(exports.socket, Array.prototype.slice.call(arguments));
  }
};

// Listen for the parent process to send the socket when a new connection is
// created
process.on('message', function (m, socket) {
  // If the message sent by the parent wasn't a socket, ignore it
  if (m !== 'socket' && m !== 'tls_socket') {
    return;
  }

  var session    = sessionManager.startSession();
  var command    = commandChannel.createChannel(socket);
  var remoteAddr = socket.remoteAddress;
  var remotePort = socket.remotePort;

  logger.log('info', '<cyan>[Process Manager]</cyan> Child process with PID %d receiving connection', process.pid);

  // Save the IP
  session.clientIp = remoteAddr;

  // TLS?
  session.isSecure = m === 'tls_socket';

  // Expose the socket
  exports.socket = socket;

  // Proxy any event listeners onto the socket
  for (var i in eventQueue) {
    socket.on.apply(socket, Array.prototype.slice.call(eventQueue[i]));
  }

  // Don't do these if we don't have an IP (we'll do it later once we get the
  // user's IP)
  if (session.clientIp) {
    logger.log('info', '[%s:%d] Client Connected, Hello', remoteAddr, remotePort);
    command.write(220, config.motd);
  }

  // Expose socket events to make for nicer code
  socket.on('data', function (data) {
    // Used only by the parent process to set the IP, used when we're in TLS
    // mode as we don't have access to the real socket.
    if (data.toString().match(/^SETIP (.*?):(.*)/) && !session.clientIp && session.isSecure) {
      var ip           = data.toString().match(/^SETIP (.*?):(.*)/);
      session.clientIp = remoteAddr = command.remoteAddress = ip[1];
      remotePort       = command.remotePort = ip[2];

      // These messares deferred until we get the IP address
      logger.log('info', '[%s:%d] Client Connected, Hello', remoteAddr, remotePort);
      command.write(220, config.motd);
      return;
    }

    // Special handling for PASS command
    if (data.toString().trim().match(/PASS /i)) {
      logger.log('info', '<grey>[%s:%d] Command:</grey>  <- PASS ********', remoteAddr, remotePort);
    } else {
      logger.log('info', '<grey>[%s:%d] Command:</grey>  <- %s', remoteAddr, remotePort, data.toString().trim());
    }

    // Emit a low level event
    socket.emit('client:data', data, socket, command, session);

    // Emit a higher level event
    socket.emit('ftp:commandReceived', data.toString(), command, session);
  });

  socket.on('end', function () {
    logger.log('info', '<grey>[%s:%d]</grey> Client Disconnected', remoteAddr, remotePort);
    socket.emit('client:end');
  });

  socket.on('close', function () {
    logger.log('info', '<grey>[%s:%d]</grey> Connection Closed, Goodbye', remoteAddr, remotePort);
    socket.emit('client:close');

    // Exit the child process once the socket has been closed
    process.exit();
  });
});

// Log when the process exits
process.on('exit', function () {
  logger.log('info', '<cyan>[Process Manager]</cyan> Exiting child process with PID %d', process.pid);
});

// Catch unhandled exceptions
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', function (err) {
  var stackTrace = err.stack.split('\n');

  for (var i = 0; i < stackTrace.length; i++) {
    logger.log('error', '<red>[Exception Handler]</red> %s', stackTrace[i]);
  }

  process.exit(1);
});
