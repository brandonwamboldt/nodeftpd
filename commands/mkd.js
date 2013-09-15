var command = require('../lib/command');
var fs      = require('fs');

command.add('MKD', function (mkdir, output, session) {
  if (mkdir.trim() === '') {
    output.write(501, 'Invalid number of arguments');
  } else {
    if (!mkdir.match(/^\//)) {
      if (session.cwd == '/') {
        mkdir = session.cwd + mkdir;
      } else {
        mkdir = session.cwd + '/' + mkdir;
      }
    }

    fs.mkdir(mkdir, function(err) {
      if (err) {
        if (err.code === 'EEXIST') {
          output.write(550, mkdir + ': File exists');
        } else {
          console.log(err);
          output.write(550, mkdir + ': Unknown error');
        }
      } else {
        output.write(257, '"' + mkdir + '" - Directory successfully created');
      }
    });
  }
});
