var command = require('../lib/command')
  , app     = require('../lib/ftpd')
  , config  = require('../lib/config')
  , state   = require('../lib/state');

command.add('PASV', function (type, output, session) {
    session.mode = 'passive';

    // Generate a passive port
    if (typeof config.get('passivePortRange') == 'string') {
        var range = config.get('passivePortRange').split('-');

        for (var port = parseInt(range[0]); port < parseInt(range[1]); port++) {
            if (state.data.passivePorts.indexOf(port) == -1) {
                state.data.passivePorts.push(port);
                break;
            }
        }
    }

    // Get the two parts of the port so it can be represented as a byte
    var port1 = Math.floor(port / 256)
      , port2 = port % 256
      , port  = app.server.address().address.replace(/\./g, ',') + ',' + port1 + ',' + port2;

    // Set the session's passive port
    session.passiveMode.port = (port1 * 256) + port2;

    output.write(227, 'Entering Passive Mode (' + port + ')');
}); 