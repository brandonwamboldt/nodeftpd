'use strict';

// Third party dependencies
var fs = require('fs');

// Local dependencies
var sessions       = require('../lib/sessions');
var commandChannel = require('../lib/command-channel');
var nodeftpd       = require('../lib/nodeftpd');

// Set the umask
process.umask(nodeftpd.config.umask);

// We need to attach listeners to the socket, but we don't get the socket for a
// while after the process starts, so we temporarily store listeners here and
// then transfer them to the socket when we receive it
var eventQueue = [];

// They attach a listener to the process uncaughtException event so we need to
// include the module now so our uncaughtException handler happens after
require('tmp');

// Load the UNIX library now so it has time to read in files
require('../lib/unix');

// New child process awaiting connections
nodeftpd.log('notice', 'Worker (pid %d) waiting', process.pid);

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

  _setupConnection(m, socket);
});

var _setupConnection = function (socketType, socket) {
  nodeftpd.log('notice', 'Worker (pid %d) receiving connection', process.pid);

  var session      = sessions.create();
  var command      = commandChannel.createChannel(socket);
  var remoteAddr   = socket.remoteAddress;
  var remotePort   = socket.remotePort;
  session.clientIp = remoteAddr;
  session.isSecure = (socketType === 'tls_socket');
  exports.socket   = socket;

  // Fix the listening address if we're bound to 0.0.0.0 by using the local
  // address of the socket
  if (nodeftpd.config.listen == "0.0.0.0") {
    nodeftpd.config.listen = socket.localAddress;
  }

  // Proxy any event listeners onto the socket
  for (var i = 0; i < eventQueue.length; i++) {
    socket.on.apply(socket, Array.prototype.slice.call(eventQueue[i]));
  }

  // Don't do these if we don't have an IP (we'll do it later once we get the
  // user's IP)
  if (session.clientIp) {
    nodeftpd.log('info', '[%s:%d] Client Connected, Hello', remoteAddr, remotePort);
    command.write(220, nodeftpd.config.motd);
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
      nodeftpd.log('info', '[%s:%d] Client Connected, Hello', remoteAddr, remotePort);
      command.write(220, nodeftpd.config.motd);
      return;
    }

    // Special handling for PASS command (we don't want to log passwords)
    if (data.toString().trim().match(/PASS /i)) {
      nodeftpd.log('info', '<grey>[%s:%d] Command:</grey>  <- PASS ********', remoteAddr, remotePort);
    } else {
      nodeftpd.log('info', '<grey>[%s:%d] Command:</grey>  <- %s', remoteAddr, remotePort, data.toString().trim());
    }

    socket.emit('client:data', data, socket, command, session);
    socket.emit('ftp:commandReceived', data.toString(), command, session);
  });

  socket.on('end', function () {
    nodeftpd.log('info', '<grey>[%s:%d]</grey> Client Disconnected', remoteAddr, remotePort);
    socket.emit('client:end');
  });

  socket.on('close', process.exit);
};

var _loadCommands = function () {
  fs.readdir(__dirname + '/../commands', function (err, files) {
    for (var i = 0; i < files.length; i++) {
      require(__dirname + '/../commands/' + files[i]);
    }
  });
};

var _loadAuthHandlers = function () {
  fs.readdir(__dirname + '/../auth', function (err, files) {
    for (var i = 0; i < files.length; i++) {
      require(__dirname + '/../auth/' + files[i]);
    }
  });
};

var _catchExceptions = function () {
  process.removeAllListeners('uncaughtException');
  process.on('uncaughtException', function (err) {
    var stackTrace = err.stack.split('\n');

    for (var i = 0; i < stackTrace.length; i++) {
      nodeftpd.log('error', '<red>[Exception Handler]</red> %s', stackTrace[i]);
    }

    process.exit(1);
  });
};

_loadCommands();
_loadAuthHandlers();
_catchExceptions();
