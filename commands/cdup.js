var command = require('../lib/command');
var fs      = require('fs');

command.add('CDUP', 'CDUP (up one directory)', cdup, {maxArguments: 0});

function cdup(cd, output, session) {
  fs.realpath(session.cwd + '/../', function (err, resolvedPath) {
    session.cwd = resolvedPath;
    output.write(250, 'CDUP command successful.');
  })
}
