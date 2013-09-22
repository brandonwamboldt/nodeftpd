var command = require('../lib/command');
var app     = require('../bin/worker');
var config  = require('../lib/config');

command.add('PASV', 'PASV (returns address/port)', function (type, output, session) {
  session.mode = 'passive';

  // Send a request for the supervisor to issue us a port #
  process.send({ action: 'get_passive_port' });

  // Listen for the port # from the supervisor
  process.on('message', function setPassivePort (message) {
    if (message.action !== 'get_passive_port') return;

    // Remove the event listener so it doesn't fire again. We can't use .once
    // here because we may be sending more messages than get_passive_port.
    process.removeListener('message', setPassivePort);

    // Get the two parts of the port so it can be represented as a byte
    session.passiveMode.port = message.port;
    var port1 = Math.floor(message.port / 256);
    var port2 = message.port % 256;
    var port  = app.socket.address().address.replace(/\./g, ',') + ',' + port1 + ',' + port2;

    output.write(227, 'Entering Passive Mode (' + port + ')');
  });
});
