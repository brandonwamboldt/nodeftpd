// Module Dependencies
var config = require('./config');
var logger = require('./logger');
var fork   = require('child_process').fork;
var net    = require('net');

// Set the logging level
logger.setLogLevel(config.get('logLevel'));

exports.start = function () {
  // Create a pool of 5 child processes to handle new connections. We always
  // want at least 5 child processes available. Each one takes about 30ms to
  // start up and uses ~10mb of memory. Results may vary.
  var pool = [
    fork('./bin/nodeftpd', ['--child']),
    fork('./bin/nodeftpd', ['--child']),
    fork('./bin/nodeftpd', ['--child']),
    fork('./bin/nodeftpd', ['--child']),
    fork('./bin/nodeftpd', ['--child'])
  ];

  // Create a new TCP Server
  var server = net.createServer(function (socket) {
    // A new connection has been established, pass it off to one of the
    // spawned processes.
    var child = pool.shift();
    child.send('socket', socket);

    // Don't let the pool of free processes go below 5
    if (pool.length < 5) {
      for (i = 0; i < 5 - pool.length; i++) {
        pool.push(fork('./bin/nodeftpd', ['--child']));
      }
    }
  });

  // Start the server and bind to the appropriate port
  server.listen(config.get('port'), config.get('listen'), function () {
    logger.log('info', '<green>[Daemon]</green> Starting NodeFTPD');
    logger.log('info', '<green>[Daemon]</green> Listening on %s:%d', config.get('listen'), config.get('port'));
  });

  // Listen for the server.close event
  server.on('close', function () {
      logger.log('info', '<green>[Daemon]</green> Shutting down NodeFTPD');
  });
};
