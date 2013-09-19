var command = require('../lib/command');
var app     = require('../bin/worker');
var config  = require('../lib/config');
var state   = require('../lib/state');

command.add('PASV', 'PASV (returns address/port)', function (type, output, session) {
  session.mode = 'passive';

  // Generate a passive port
  if (typeof config.passive_port_range === 'string') {
    var range = config.passive_port_range.split('-');

    for (var port = parseInt(range[0]); port < parseInt(range[1]); port++) {
      if (state.data.passivePorts.indexOf(port) === -1) {
        state.data.passivePorts.push(port);
        break;
      }
    }
  }

  // Get the two parts of the port so it can be represented as a byte
  var port1 = Math.floor(port / 256);
  var port2 = port % 256;
  var port  = app.socket.address().address.replace(/\./g, ',') + ',' + port1 + ',' + port2;

  // Set the session's passive port
  session.passiveMode.port = (port1 * 256) + port2;

  output.write(227, 'Entering Passive Mode (' + port + ')');
});
