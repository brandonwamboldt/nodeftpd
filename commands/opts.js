'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 *
 */
command.add('OPTS', 'OPTS <sp> command [<sp> options]', function (parameters, commandChannel, session) {
  var option = parameters.match(/^([^ ]+)/)[1];
  var value  = parameters.match(/^[^ ]+ (.*)/)[1];
  session.parameters[option] = value;

  commandChannel.write(200, option + ' set to ' + value.toLowerCase());
});
