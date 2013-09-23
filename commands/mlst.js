'use strict';

// Local Dependencies
var facter  = require('../lib/facts');
var fs      = require('../lib/fs');
var command = require('../lib/command');

/**
 * SIZE is defined in RFC 3659 - Extensions to FTP
 */
command.add('MLST', 'MLST [<sp> pathname]', function (pathname, commandChannel, session) {
  var absolutePath = fs.toAbsolute(pathname, session.cwd);

  fs.stat(absolutePath, function (err, stat) {
    var facts = '';
    facts += 'modify=' + facter.modify(stat);
    facts += ';perm=' + facter.perm(stat, session.user);

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
    facts += ';UNIX.group=' + stat.gid;
    facts += ';UNIX.mode=' + stat.mode.toString(10).substring(2);
    facts += ';UNIX.owner=' + stat.uid;
    facts += '; ' + absolutePath;

    commandChannel.write(250, '- Start of list for ' + absolutePath);
    commandChannel.write(' ' + facts);
    commandChannel.write('');
    commandChannel.write(250, 'End of list');
  });
});
