'use strict';

// Local Dependencies
var facter  = require('../lib/facts');
var fs      = require('../lib/fs');
var command = require('../lib/command');
var unix    = require('../lib/unix');

/**
 * RFC Reference: rfc3659 - Extensions to FTP
 */
command.add('MLST', 'MLST [<sp> pathname]', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.stat(absolutePath, function (err, stat) {
    var facts = '';
    facts += 'modify=' + facter.modify(stat);
    facts += ';perm=' + facter.perm(stat, session.user);
    facts += ';size=' + stat.size;

    if (stat.isFile()) {
      facts += ';type=file';
    } else if (pathname === '' || pathname === '.') {
      facts += ';type=cdir';
    } else if (pathname === '../' || pathname === '..') {
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
    facts += '; ' + absolutePath;

    commandChannel.write(250, '- Start of list for ' + absolutePath);
    commandChannel.write(' ' + facts);
    commandChannel.write('');
    commandChannel.write(250, 'End of list');
  });
});
