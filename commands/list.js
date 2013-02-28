exports = module.exports = (function(app) {
    var net = require('net')
      , fs  = require('fs');

    app.server.on('ftp:command_received', function(command, type, output, session) {
        if (command === 'LIST') {
            // Create a generic TCP/IP server
            var server2 = net.createServer(function(nconn) {
                //app.logger('[' + nconn.remoteAddress + ':' + nconn.remotePort + '] Connected to passive server on port 1234');

                fs.readdir(session.cwd, function(err, files) {
                    if (files == null) {
                        files = [];
                    }
                    
                    for (var i = 0; i < files.length; i++) {
                        var stat   = fs.statSync(session.cwd + '/' + files[i])
                          , date   = stat.mtime
                          , months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                          , mode   = ''
                          , omode  = parseInt(stat.mode.toString(8), 10)
                          , omode  = omode.toString().substr(omode.toString().length - 3);

                        if (stat.isFile()) {
                            mode += '-';
                        } else {
                            mode += 'd';
                        }

                        for (var j = 0; j < 3; j++) {
                            if (omode[j] == '0') {
                                mode += '---';
                            } else if (omode[j] == '1') {
                                mode += '--x';
                            } else if (omode[j] == '2') {
                                mode += '-w-';
                            } else if (omode[j] == '3') {
                                mode += '-wx';
                            } else if (omode[j] == '4') {
                                mode += 'r--';
                            } else if (omode[j] == '5') {
                                mode += 'r-x';
                            } else if (omode[j] == '6') {
                                mode += 'rw-';
                            } else if (omode[j] == '7') {
                                mode += 'rwx';
                            }
                        }

                        nconn.write(mode + ' 1 ' + stat.uid + ' ' + stat.gid + '  0 ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + ' ' + files[i] + '\n');
                    }
                    
                    nconn.end();
                    server2.close();
                    output.write(226, 'Directory send OK.');
                });
            });

            server2.listen(28527, app.config.listen);

            output.write(150, 'Here comes the directory listing.');
        }
    });
});