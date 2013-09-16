var command = require('../lib/command');
var config  = require('../lib/config');
var channel = require('../lib/datachannel');
var net     = require('net');
var fs      = require('../lib/fs');

command.add('NLST', 'NLST [<sp> pathname]', nlst);

function nlst(pathame, output, session) {
  // Create a new data channel
  var success = channel.create(session, function (socket, done) {
    // Read in the files/directories in the user's current working
    // directory
    fs.readdir(session.cwd, function (err, files) {
      if (files === null) {
        files = [];
      }

      for (var i = 0; i < files.length; i++) {
        socket.write(files[i] + '\n');
      }

      output.write(226, 'Directory sent OK.');

      done();
    });
  });

  if (!success) {
    output.write(425, 'Unable to build data connection: Invalid argument');
  } else {
    output.write(150, 'Here comes the directory listing.');
  }
}
