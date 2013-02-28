exports = module.exports = (function(app) {
    app.server.on('ftp:command_received', function(command, parameters, output, session) {
        if (command === 'PORT') {
            // Set the FTP mode to Active
            session.mode = 'active';

            // Get the IP/port
            parameters = parameters.split(',');
            session.activeMode.clientIp = parameters.slice(0, 4).join('.');
            session.activeMode.clientPort = (parseInt(parameters[4]) * 256) + parseInt(parameters[5]);

            output.write(200, 'PORT command successful, will transmit to ' + session.activeMode.clientIp + ':' + session.activeMode.clientPort);
        } 
    });
});