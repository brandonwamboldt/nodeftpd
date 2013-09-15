var command        = require('../lib/command');
var config         = require('../lib/config');
var sessionManager = require('../lib/session-manager');

command.add('REIN', 'REIN (restart control connection)', function (parameters, output, session) {
  session = sessionManager.startSession();
  output.write(220, config.get('motd'));
});
