exports = module.exports = function (config) {
    var net     = require('net')
      , fs      = require('fs')
      , Session = require('./session')
      , logger  = new require('./logger')()
      , output  = new require('./output')(logger);

    // Set the logging level
    logger.setLogLevel(config.get("logLevel"));

    // Create a new TCP Server
    var server = net.createServer(function(socket) {        
        logger.log('info', '[' + socket.remoteAddress + ':' + socket.remotePort + '] Client Connected');

        // Tell the Output object to use this socket
        output.setSocket(socket);

        // Expose the connection event externally
        server.emit('client:connect', socket);

        // Initialize a new FTP session
        var session = new Session();

        // Send a hello message
        socket.write('220 ' + config.get("motd") + '\n');

        // Expose socket events to make for nicer code
        socket.on('data', function(data) {
            logger.log('info', '[' + socket.remoteAddress + ':' + socket.remotePort + '] Command received: ' + data.toString().trim());

            var command    = data.toString().match(/^([A-Za-z]+)/);

            if (command != null) {
                command = command[1].toUpperCase();
            } else {
                output.write(500, 'Unknown command.');
                return;
            }

            var parameters = data.toString().match(/^[A-Za-z]+ (.*)/);

            if (parameters != null) {
                parameters = parameters[1];
            } else {
                parameters = '';
            }

            // Emit a low level event
            server.emit('client:data', data, socket, output, session);

            // Emit a higher level event
            server.emit('ftp:command_received', command, parameters, output, session, socket);
        });

        socket.on('end', function() {
            logger.log('info', 'Client Disconnected');
            server.emit('client:end');
        });

        socket.on('close', function() {
            server.emit('client:close');
        });
    });
    
    // Listen for the server.close event
    server.on('close', function () {
        logger.log('info', 'Shutting down NodeFTPD');
    });
    
    // Start the server and bind to the appropriate port
    server.listen(config.get("port"), config.get("listen"), function () {
        logger.log('info', 'Starting NodeFTPD');
        logger.log('info', 'Listening on ' + config.get("listen") + ':' + config.get("port"));
    });

    server.setMaxListeners(200); 

    return {
        config: config,
        logger: logger,
        server: server
    }
}