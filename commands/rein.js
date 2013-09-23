'use strict';

// Local dependencies
var command        = require('../lib/command');
var config         = require('../lib/config');
var sessionManager = require('../lib/session-manager');

/**
 *
 */
command.add('REIN', 'REIN (restart control connection)', function (nil, commandChannel, session) {
  session = sessionManager.startSession();
  commandChannel.write(220, config.get('motd'));
});
