'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * FEAT is defined in RFC 2389 - Feature negotiation mechanism for the File
 * Transfer Protocol
 */
command.add('FEAT', 'FEAT (returns feature list)', function (nil, commandChannel) {
  commandChannel.write(211, '-Features');
  commandChannel.write('MDTM');
  commandChannel.write('REST STREAM');
  commandChannel.write('PASV');
  commandChannel.write('SIZE');
  commandChannel.write(211, 'end');
});
