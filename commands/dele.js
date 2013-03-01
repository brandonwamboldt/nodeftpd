var command = require('../lib/command')
  , fs      = require('fs');

command.add('DELE', function (rm, output, session) {
    if (rm.trim() == '') {
        output.write(501, 'Invalid number of arguments');
    } else {
        if (!rm.match(/^\//)) {
            if (session.cwd == '/') {
                rm = session.cwd + rm;
            } else {
                rm = session.cwd + '/' + rm;
            }
        }

        fs.unlink(rm, function(err) {
            if (err) {
                if (err.code == 'ENOENT') {
                    output.write(550, rm + ': File or directory does not exist');
                } else {
                    console.log(err);
                    output.write(550, rm + ': Unknown error');
                }
            } else {
                output.write(250, 'DELE command successful');
            }
        });
    }
});
