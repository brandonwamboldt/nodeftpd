/**
 * Create a new FTP session and set the session defaults based on the current
 * server configuration.
 *
 * @return {Object}
 */
exports.startSession = function () {
    return {
        // Whether or not the user has sent a valid USER/PASS command
        authenticated : false,

        // User that the client authenticated as with the USER command
        user : '',

        // Current working directory
        cwd : '/',

        // Transfer type (See http://www.ietf.org/rfc/rfc959.txt,
        // REPRESENTATION TYPE)
        type : 'L8',

        // Transfer type (human friendly label)
        transferType : 'binary',

        // Transfer mode (active or passive)
        mode : 'active',

        // Settings for active mode data connections
        activeMode : {
            clientIp   : '',
            clientPort : 0
        },

        // Settings for passive mode data connections
        passiveMode   : {
            port : 0
        },

        // FTP parameters
        parameters    : {
            UTF8: 'on'
        }
    }
}
