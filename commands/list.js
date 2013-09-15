var command = require('../lib/command');
var config  = require('../lib/config');
var channel = require('../lib/datachannel');
var net     = require('net');
var fs      = require('fs');

command.add('LIST', 'LIST [<sp> pathname]', list);

function list(type, output, session) {
  // Create a new data channel
  var success = channel.create(session, function (socket, done) {
    // Read in the files/directories in the user's current working
    // directory
    fs.readdir(session.cwd, function (err, files) {
      if (files === null) {
        files = [];
      }

      for (var i = 0; i < files.length; i++) {
        var stat   = fs.statSync(session.cwd + '/' + files[i]);
        var date   = stat.mtime;
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var mode   = '';
        var omode  = parseInt(stat.mode.toString(8), 10);
        var omode  = omode.toString().substr(omode.toString().length - 3);

        if (stat.isFile()) {
          mode += '-';
        } else {
          mode += 'd';
        }

        for (var j = 0; j < 3; j++) {
          if (omode[j] == '0') {
            mode += '---';
          } else if (omode[j] == '1') {
            mode += '--x';
          } else if (omode[j] == '2') {
            mode += '-w-';
          } else if (omode[j] == '3') {
            mode += '-wx';
          } else if (omode[j] == '4') {
            mode += 'r--';
          } else if (omode[j] == '5') {
            mode += 'r-x';
          } else if (omode[j] == '6') {
            mode += 'rw-';
          } else if (omode[j] == '7') {
            mode += 'rwx';
          }
        }

        socket.write(mode + ' 1 ' + stat.uid + ' ' + stat.gid + '  ' + stat.size + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + ' ' + files[i] + '\n');
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
