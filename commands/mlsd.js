'use strict';

// Local Dependencies
var facter      = require('../lib/facts');
var fs          = require('../lib/fs');
var unix        = require('../lib/unix');
var command     = require('../lib/command');
var dataChannel = require('../lib/data-channel');

/**
 * RFC Reference: rfc3659 - Extensions to FTP
 */
command.add('MLSD', 'MLSD [<sp> pathname]', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  // Create a new data channel
  fs.readdir(absolutePath, function (err, files) {
    if (err) {
      commandChannel.write(550, fs.errorMessage(err, pathname));
    } else {
      if (dataChannel.isReady()) {
        commandChannel.write(150, 'Opening ASCII mode data connection for MLSD');
      } else {
        commandChannel.write(425, 'Unable to build data connection: Invalid argument');
      }

      dataChannel.onReady(function (socket, done) {
        var stat = null;

        for (var i = 0; i < files.length; i++) {
          try {
            stat = fs.statSync(fs.toAbsolute(files[i], absolutePath));
          } catch (err) {
            commandChannel.write(550, fs.errorMessage(err, files[i]));
            done();
            return;
          }

          var facts = '';
          facts += 'modify=' + facter.modify(stat);
          facts += ';perm=' + facter.perm(stat, session.user);
          facts += ';size=' + stat.size;

          if (stat.isFile()) {
            facts += ';type=file';
          } else if (files[i] === '' || files[i] === '.') {
            facts += ';type=cdir';
          } else if (files[i] === '../' || files[i] === '..') {
            facts += ';type=pdir';
          } else if (stat.isDirectory()) {
            facts += ';type=dir';
          } else {
            facts += ';type=file';
          }

          facts += ';unique=' + facter.unique(stat);
          facts += ';UNIX.group=' + unix.getGroup({ gid: stat.gid })[0].group;
          facts += ';UNIX.gid=' + stat.gid;
          facts += ';UNIX.mode=' + stat.mode.toString(8).slice(-3);
          facts += ';UNIX.owner=' + unix.getUser({ uid: stat.uid })[0].username;
          facts += ';UNIX.uid=' + stat.uid;
          facts += '; ' + files[i] + '\r\n';

          socket.write(facts);
        }

        commandChannel.write(226, 'Transfer complete');

        done();
      });
    }
  });
});
