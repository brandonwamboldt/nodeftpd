exports.create = function() {
    return {
        user          : '',
        authenticated : false,
        cwd           : '/',
        type          : 'L8',
        transferType  : 'binary',
        mode          : 'active',
        activeMode    : {
            clientIp   : '',
            clientPort : 0
        },
        passiveMode   : {
            port : 0
        },
        parameters    : {
            UTF8: 'on'
        }
    };
};
