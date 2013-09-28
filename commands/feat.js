'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * FEAT is defined in RFC 2389 - Feature negotiation mechanism for the File
 * Transfer Protocol
 */
command.add('FEAT', 'FEAT (returns feature list)', function (nil, commandChannel) {
  commandChannel.write(211, '-Features');
  commandChannel.write('EPSV');
  commandChannel.write('EPRT');
  commandChannel.write('UTF8');
  commandChannel.write('MDTM');
  commandChannel.write('MFMT');
  //commandChannel.write('AUTH TLS');
  commandChannel.write('MLSD');
  commandChannel.write('MLST modify*;perm*;size*;type*;unique*;UNIX.group*;UNIX.gid*;UNIX.mode*;UNIX.owner*;UNIX.uid*;');
  commandChannel.write('PASV');
  commandChannel.write('PBSZ');
  commandChannel.write('PROT');
  commandChannel.write('REST STREAM');
  commandChannel.write('SIZE');
  commandChannel.write(211, 'end');
});
