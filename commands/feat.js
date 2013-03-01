var command = require('../lib/command');

command.add('FEAT', function (parameters, output, session) {
    output.write(211, '-Features');
    output.write('SIZE');
    output.write('MDTM');
    output.write('LANG EN*');
    output.write('REST STREAM');
    output.write('TVFS');
    output.write('PASV');
    output.write('UTF8');
    output.write(211, 'end');
});
