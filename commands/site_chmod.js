var command = require('../lib/command');
var fs      = require('fs');

command.add('SITE CHMOD', '', function (parameters, output, session) {
  var params = parameters.match(/([^ ]+) (.*)/);

  if (params.length !== 3) {
    output.write(500, "-'SITE CHMOD " + parameters + "' not understood");
    output.write(500, ' SITE not understood');
  } else {
    if (!params[2].match(/^\//)) {
      if (session.cwd === '/') {
        params[2] = session.cwd + params[2];
      } else {
        params[2] = session.cwd + '/' + params[2];
      }
    }

    fs.chmod(params[2], '' + params[1], function(err) {
      if (err) {
        if (err.code === 'ENOENT') {
          output.write(550, params[2] + ': File or directory does not exist');
        } else {
          console.log(err);
          output.write(550, params[2] + ': Unknown error');
        }
      } else {
        output.write(200, "SITE CHMOD command successful");
      }
    });
  }
});
