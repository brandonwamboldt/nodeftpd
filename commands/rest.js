var command = require('../lib/command');
var fs      = require('../lib/fs');

command.add('REST', 'REST <sp> byte-count', function (byteCount, output, session) {
  session.restByteCount = parseInt(byteCount);

  output.write(350, 'Restarting at ' + byteCount + '. Send STORE or RETRIEVE to initiate transfer');
});
