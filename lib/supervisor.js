// Third party dependencies
var fork = require('child_process').fork;

// Local dependencies
var config = require('../lib/config');

// Reference to the current module
var supervisor = exports = module.exports;

/**
 * Pool of available child processes to handle incoming connections.
 */
exports.pool = [];

/**
 * Pool of passive ports currently in use.
 */
exports.passivePortPool = [];

/**
 * Remove a worker from the pool of available workers and return it. If the pool
 * is below the minimum size, spawn new workers.
 * @return {ChildProcess}
 */
exports.useWorker = function () {
  var worker = supervisor.pool.shift();

  // Don't let the pool of free processes go below 5
  if (supervisor.pool.length < 5) {
    for (i = 0; i < 5 - supervisor.pool.length; i++) {
      supervisor.spawnWorker();
    }
  }

  return worker;
};

/**
 * Spawn a new worker process.
 * @return {ChildProcess}
 */
exports.spawnWorker = function () {
  // Spawn a new worker process
  var worker = fork('./bin/worker');

  // Handle messaging from the child process
  worker.on('message', supervisor.messageRouter.bind(worker));

  // Add the worker to the pool
  exports.pool.push(worker);

  return worker;
};

/**
 * Spawn a number of new worker processes.
 * @param {!integer} numWorkers
 */
exports.spawnWorkers = function (numWorkers) {
  for (var i = 0; i < numWorkers; i++) {
    supervisor.spawnWorker();
  }
};

/**
 * Handle messages from child processes.
 * @param {!object} message
 */
exports.messageRouter = function (message) {
  switch (message.action) {
    case 'get_passive_port':
      this.send({ action: 'get_passive_port', port: supervisor.getPassivePort() });
      break;
    case 'free_passive_port':
      supervisor.freePassivePort(message.port);
      break;
  }
};

/**
 * Get a port in the assigned range that isn't in use.
 * @return {integer}
 */
exports.getPassivePort = function () {
  var range   = config.passive_port_range.split('-');
  var minPort = parseInt(range[0]);
  var maxPort = parseInt(range[1]);

  // Generate a random port number between our min and max port that isn't in
  // use
  while (true) {
    var port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;

    if (supervisor.passivePortPool.indexOf(port) === -1) {
      break;
    }
  }

  // Mark this port as in use
  supervisor.passivePortPool.push(port);

  return port;
};

/**
 * Remove a port from the pool of in-use ports.
 * @param {!integer}
 */
exports.freePassivePort = function (port) {
  var index = supervisor.passivePortPool.indexOf(port);

  if (index !== -1) {
    supervisor.passivePortPool.splice(index, 1);
  }
};
