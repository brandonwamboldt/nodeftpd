var command = require('../lib/command');
var fs      = require('../lib/fs');

command.add('CWD', 'CWD <sp> pathname', { maxArguments: 1, minArguments: 1 }, function (pathname, output, session) {
  var oldcwd = session.cwd;

  if (pathname.substr(pathname.length - 1) === '/') {
    pathname = pathname.substring(0, pathname.length - 1);
  }

  if (pathname === '') {
    session.cwd = '/';
  } else if (pathname.substr(0, 1) === '/') {
    session.cwd = pathname;
  } else {
    if (session.cwd === '/') {
      session.cwd += pathname;
    } else {
      session.cwd += '/' + pathname;
    }
  }

  fs.readdir(session.cwd, function (err, files) {
    if (err) {
      output.write(550, session.cwd + ': No such file or directory');
      session.cwd = oldcwd;
    } else {
     output.write(250, '"' + session.cwd + '" is the new working directory.');
    }
  });
});
