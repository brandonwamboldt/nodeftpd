// Module Dependencies
var sessionManager = require('./session-manager')
  , commandChannel = require('./command-channel')
  , config         = require('./config')
  , logger         = require('./logger')
  , net            = require('net')
  , fs             = require('fs')

// Set the logging level
logger.setLogLevel(config.get('logLevel'))

// Expose the server
exports.server = {}

// Function to start the FTP server
exports.start = function () {
    var server

    // Load command modules
    fs.readdir(__dirname + '/../commands', function (err, files) {
        for (var i = 0; i < files.length; i++) {
            require(__dirname + '/../commands/' + files[i])
        }
    })

    // Create a new TCP Server
    server = exports.server = net.createServer(function (socket) {
        var session    = sessionManager.startSession()
          , command    = commandChannel.createChannel(socket)
          , remoteAddr = socket.remoteAddress
          , remotePort = socket.remotePort

        logger.log('info', '[%s:%d] Client Connected, Hello', remoteAddr, remotePort)

        // Expose the connection event externally
        server.emit('client:connect', socket)

        // Send a hello message
        command.write(220, config.get('motd'))

        // Expose socket events to make for nicer code
        socket.on('data', function (data) {
            logger.log('info', '[%s:%d] Command received: %s', remoteAddr, remotePort, data.toString().trim())

            // Emit a low level event
            server.emit('client:data', data, socket, command, session)

            // Emit a higher level event
            server.emit('ftp:commandReceived', data.toString(), command, session)
        })

        socket.on('end', function () {
            logger.log('info', '[%s:%d] Client Disconnected', remoteAddr, remotePort)
            server.emit('client:end')
        })

        socket.on('close', function () {
            logger.log('info', '[%s:%d] Connection Closed, Goodbye', remoteAddr, remotePort)
            server.emit('client:close')
        })
    })

    // Disable max listeners check, since we'd get warnings because of how each
    // FTP command is attached as a listener.
    server.setMaxListeners(0)

    // Start the server and bind to the appropriate port
    server.listen(config.get('port'), config.get('listen'), function () {
        logger.log('info', 'Starting NodeFTPD')
        logger.log('info', 'Listening on %s:%d', config.get('listen'), config.get('port'))
    })

    // Listen for the server.close event
    server.on('close', function () {
        logger.log('info', 'Shutting down NodeFTPD')
    })
}
