// Module Dependencies
var Session = require('./session')
  , Output  = require('./output')
  , net     = require('net')
  , fs      = require('fs')
  , config  = require('./config')
  , logger  = require('./logger');

// Set the logging level
logger.setLogLevel(config.get("logLevel"));

// Expose the server
exports.server = {};

exports.start = function () {
    // Create a new TCP Server
    exports.server = net.createServer(function(socket) {

        // Load command modules
        fs.readdir(__dirname + '/../commands', function(err, files) {
            for (var i = 0; i < files.length; i++) {
                require(__dirname + '/../commands/' + files[i]);
            }
        });
        
        // Variable declarations
        var session, output;

        logger.log('info', '[' + socket.remoteAddress + ':' + socket.remotePort + '] Client Connected');

        // Initialize a new FTP session
        session = Session.create();

        // Initialize a new output channel
        output = Output.create(socket);
        
        // Expose the connection event externally
        exports.server.emit('client:connect', socket);

        // Send a hello message
        socket.write('220 ' + config.get("motd") + '\n');

        // Expose socket events to make for nicer code
        socket.on('data', function(data) {
            logger.log('info', '[' + socket.remoteAddress + ':' + socket.remotePort + '] Command received: ' + data.toString().trim());

            // Emit a low level event
            exports.server.emit('client:data', data, socket, output, session);

            // Emit a higher level event
            exports.server.emit('ftp:commandReceived', data.toString(), output, session);
        });

        socket.on('end', function() {
            logger.log('info', 'Client Disconnected');
            exports.server.emit('client:end');
        });

        socket.on('close', function() {
            exports.server.emit('client:close');
        });
    });

    // Listen for the server.close event
    exports.server.on('close', function () {
        logger.log('info', 'Shutting down NodeFTPD');
    });
    
    // Start the server and bind to the appropriate port
    exports.server.listen(config.get("port"), config.get("listen"), function () {
        logger.log('info', 'Starting NodeFTPD');
        logger.log('info', 'Listening on ' + config.get("listen") + ':' + config.get("port"));
    });

    // Disable max listeners check
    exports.server.setMaxListeners(0); 
}

