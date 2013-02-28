exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'FEAT') {
            output.write(211, '-Features');
            output.write('SIZE');
            output.write('MDTM');
            output.write('LANG EN*');
            output.write('REST STREAM');
            output.write('TVFS');
            output.write('PASV');
            output.write('UTF8');
            output.write(211, 'end');
        } 
    });
});