var command = require('../lib/command');
var fs      = require('../lib/fs');

command.add('MKD', 'MKD <sp> pathname', function (pathname, output, session) {
  if (pathname.trim() === '') {
    output.write(501, 'Invalid number of arguments');
  } else {
    if (!pathname.match(/^\//)) {
      if (session.cwd == '/') {
        pathname = session.cwd + pathname;
      } else {
        pathname = session.cwd + '/' + pathname;
      }
    }

    fs.mkdir(pathname, function(err) {
      if (err) {
        if (err.code === 'EEXIST') {
          output.write(550, pathname + ': File exists');
        } else {
          console.log(err);
          output.write(550, pathname + ': Unknown error');
        }
      } else {
        output.write(257, '"' + pathname + '" - Directory successfully created');
      }
    });
  }
});
