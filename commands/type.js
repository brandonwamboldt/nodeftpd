var command = require('../lib/command');

command.add('TYPE', 'TYPE <sp> type-code (A, I, L 7, L 8)', function (type, output, session) {
  var typeChar   = type.substr(0, 1);
  var secondChar = type.substr(1, 1);

  if (type.length > 2) {
    output.write(500, 'Unrecognized TYPE command.');
  } else if (typeChar === 'A') {
    if (secondChar !== '') {
      output.write(500, 'Unrecognized TYPE command.');
    } else {
      output.write(200, 'Switching to ASCII mode.');
      session.type = 'A';
      session.transferType = 'ASCII';
    }
  } else if (typeChar === 'I') {
    output.write(200, 'Switching to Binary mode.');
    session.type = 'I';
    session.transferType = 'binary';
  } else if (typeChar === 'L') {
    if (!secondChar || secondChar < 0) {
      output.write(500, 'Unrecognized TYPE command.');
    } else {
      output.write(200, 'Switching to Binary mode.');
      session.type = 'L' + secondChar;
      session.transferType = 'binary';
    }
  } else {
    output.write(500, 'Unrecognized TYPE command.');
  }
});
