// Local dependencies
var command = require('../lib/command');

/**
 * A HELP request asks for human-readable information from the server. The
 * server may accept this request with code 211 or 214, or reject it with code
 * 502.
 *
 * A HELP request may include a parameter. The meaning of the parameter is
 * defined by the server. Some servers interpret the parameter as an FTP verb,
 * and respond by briefly explaining the syntax of the verb:
 *
 *     HELP RETR
 *     214 Syntax: RETR <sp> file-name
 *     HELP FOO
 *     502 Unknown command FOO.
 *
 * I use HELP (without a parameter) in automated surveys of FTP servers. The
 * HELP response is a good place for server implementors to declare the
 * operating system type and the name of the server program.
 */
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
