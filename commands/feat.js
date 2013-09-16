var command = require('../lib/command');

command.add('FEAT', 'FEAT (returns feature list)', function (parameters, output, session) {
  output.write(211, '-Features');
  output.write('MDTM');
  output.write('MLST modify*;perm*;size*;type*;unique*;UNIX.group*;UNIX.mode*;UNIX.owner*;');;
  output.write('REST STREAM');
  output.write('PASV');
  output.write('SIZE');
  output.write(211, 'end');
});
