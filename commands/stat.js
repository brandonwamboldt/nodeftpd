var command = require('../lib/command');

command.add('STAT', 'STAT [<sp> pathname]', function (parameters, output, session) {
  output.write(211, '-Status of \'NodeFTPD\'');
  output.write('Connected from ' + session.clientIp + ' (' + session.clientIp + ')');
  output.write('Logged in as ' + session.user.username);
  output.write('TYPE: ' + session.transferType + ', STRUcture: File, Mode: Stream');
  output.write('Total bytes transferred for session: ' + session.bytesTransferred);

  if (session.dataChannel) {
    output.write('Open data connection');
  } else {
    output.write('No data connection');
  }
  output.write(211, 'End of status');
});
