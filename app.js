var net    = require('net')
  , events = require('events')
  , fs     = require('fs');

function getTypeNiceName(type) {
    if (type.substr(0, 1) == 'A') {
        return 'ASCII text';
    } else if (type.substr(0, 1) == 'E') {
        return 'EBCDIC text';
    } else if (type.substr(0, 1) == 'I') {
        return 'image (binary data)';
    } else if (type.substr(0, 1) == 'L') {
        return 'local format';
    }
}

// Create a generic TCP/IP server
var server = net.createServer(function(conn) {
    var session = {
        user: '',
        authenticated: false,
        cwd: '/',
        type: 'L8',
        mode: 'active',
        parameters: {
            UTF8: 'on'
        }
    };

    console.log('Client Connected');
    conn.write('220 NodeFTPD 0.1a Server (NodeFTPD) [dev]\n');

    conn.on('end', function() {
        console.log('Client Disconnected');
    });

    conn.on('data', function(data) {
        var msg = data.toString();

        console.log('Command received: ' + msg.trim());

        if (msg.match(/^USER /)) {
            session.user = msg.match(/^USER (.*)/)[1];
            response = '331 Password required to access user account ' + msg.trim();
        } else if (msg.match(/^PASS /)) {
            session.authenticated = true;
            response = '230 Authenticated as ' + session.user;
        } else if (msg.match(/^CWD /)) {
            var cd = msg.match(/^CWD (.*)/)[1];

            if (cd.substr(cd.length - 1) == '/') {
                cd = cd.substring(0, cd.length - 1);
            }

            if (cd.substr(0, 1) == '/') {
                session.cwd = cd;
            } else {
                if (session.cwd == '/') {
                    session.cwd += cd;
                } else {
                    session.cwd += '/' + cd;
                }
            }

            response = '250 "' + session.cwd + '" is new working directory.';
        } else if (msg.match(/^PORT /)) {
            response = '200 PORT command successful.';
        } else if (msg.match(/^SYST/)) {
            response = '215 UNIX Type: ' + session.type;
        } else if (msg.match(/^FEAT/)) {
            response  = '211-Features\n';
            response += ' SIZE\n';
            response += ' MDTM\n';
            //response += ' MLST size*;type*;perm*;create*;modify*;\n';
            response += ' LANG EN*\n';
            response += ' REST STREAM\n';
            response += ' TVFS\n';
            response += ' UTF8\n';
            response += '211 end';
        } else if (msg.match(/^OPTS /)) {
            var option = msg.match(/^OPTS ([^ ]+)/)[1];
            var value  = msg.match(/^OPTS [^ ]+ (.*)/)[1];
            session.parameters[option] = value;

            response = '200 ' + option + ' set to ' + value.toLowerCase();
        } else if (msg.match(/^PWD/)) {
            response = '257 "' + session.cwd + '"'
        } else if (msg.match(/^TYPE/)) {
            var type = msg.match(/^TYPE (.*)/)[1];
            var typeChar = type.substr(0, 1);
            var secondChar = type.substr(1, 1);

            if (type.length > 2) {
                response = '500 Unrecognized TYPE command.';
            } else if (typeChar == 'A') {
                if (secondChar != '') {
                    response = '500 Unrecognized TYPE command.';
                } else {
                    response = '200 Switching to ASCII mode.';
                }
            } else if (typeChar == 'I') {
                response = '200 Switching to Binary mode.';
            } else if (typeChar == 'L') {
                if (!secondChar || secondChar < 0) {
                    response = '500 Unrecognized TYPE command.';
                } else {
                    response = '200 Switching to Binary mode.';
                }
            } else {
                response = '500 Unrecognized TYPE command.'
            }
        } else if (msg.match(/^PASV/)) {
            session.mode = 'passive';
            // Port 28526
            response = '227 Entering Passive Mode (192,168,221,148,111,110)';
        } else if (msg.match(/^LIST/)) {
            // Create a generic TCP/IP server
            var server2 = net.createServer(function(nconn) {
                console.log('Client Connected To Passive Server');

                fs.readdir(session.cwd, function(err, files) {
                    for (var i = 0; i < files.length; i++) {
                        var stat = fs.statSync(session.cwd + '/' + files[i]);
                        var date = stat.mtime;
                        console.log(date);
                        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                        var mode = '';

                        if (stat.isFile()) {
                            mode += '-';
                        } else {
                            mode += 'd';
                        }

                        var omode = parseInt(stat.mode.toString(8), 10);
                        omode = omode.toString().substr(omode.toString().length - 3);
                        
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
                    conn.write('226 Directory send OK.\n');
                });
            });

            server2.listen(28526);

            response  = '150 Here comes the directory listing.\n';
        } else {
            response = '500 Unrecognized Command';
        }

        console.log('        Response: ' + response);
        conn.write(response + '\n');
    });
});

server.listen(21, function() {
  console.log('server bound');
});