var command = require('../lib/command');

command.add('HELP', 'HELP [<sp> command]', function (subCommand, output, session) {
  if (subCommand && command.exists(subCommand)) {
    output.write(214, command.help(subCommand));
  } else if (subCommand) {
    output.write(502, 'Unknown command \'' + subCommand + '\'');
  } else {
    output.write(214, '-The following commands are recognized (* =>\'s unimplemented):');
    output.write('CDUP CWD DELE FEAT HELP LIST MKD NOOP');
    output.write('OPTS PASS PASV PORT PWD QUIT REIN RETR');
    output.write('RETR RMD RNFR RNTO SITE SIZE STOR SYST');
    output.write('TYPE USER');
    output.write(214, 'Direct comments to site administrator');
  }
});
