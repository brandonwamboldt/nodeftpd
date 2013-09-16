var command = require('../lib/command');
var config  = require('../lib/config');
var channel = require('../lib/datachannel');
// Dependencies
var facter  = require('../lib/facts');
var fs      = require('../lib/fs');
var moment  = require('moment');
var path    = require('path');
var net     = require('net');

command.add('MLST', 'MLST [<sp> pathname]', function (pathname, output, session) {
  pathname = pathname || '';

  fs.stat(path.normalize(session.cwd + '/' + pathname), function (err, stat) {
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
    facts += '; ' + path.normalize(session.cwd + '/' + pathname);

    output.write(250, '- Start of list for ' + path.normalize(session.cwd + '/' + pathname));
    output.write(' ' + facts);
    output.write('');
    output.write(250, 'End of list');
  });
});
