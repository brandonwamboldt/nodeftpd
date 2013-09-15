var command = require('../lib/command');

command.add('OPTS', 'OPTS <sp> command [<sp> options]', function (parameters, output, session) {
  var option = parameters.match(/^([^ ]+)/)[1];
  var value  = parameters.match(/^[^ ]+ (.*)/)[1];
  session.parameters[option] = value;

  output.write(200, option + ' set to ' + value.toLowerCase());
});
