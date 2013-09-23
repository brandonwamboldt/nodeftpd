'use strict';

// Local dependencies
var command = require('../lib/command');
var fs      = require('../lib/fs');

/**
 *
 */
command.add('SITE CHMOD', '', function (parameters, commandChannel, session) {
  var params = parameters.match(/([^ ]+) (.*)/);

  if (params.length !== 3) {
    commandChannel.write(500, "-'SITE CHMOD " + parameters + "' not understood");
    commandChannel.write(500, ' SITE not understood');
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
          commandChannel.write(550, params[2] + ': File or directory does not exist');
        } else {
          console.log(err);
          commandChannel.write(550, params[2] + ': Unknown error');
        }
      } else {
        commandChannel.write(200, "SITE CHMOD command successful");
      }
    });
  }
});
