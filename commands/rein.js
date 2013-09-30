'use strict';

// Local dependencies
var command  = require('../lib/command');
var config   = require('../lib/config');
var sessions = require('../lib/sessions');

/**
 *
 */
command.add('REIN', 'REIN (restart control connection)', function (nil, commandChannel, session) {
  session = sessions.start();
  commandChannel.write(220, config.get('motd'));
});
