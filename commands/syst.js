'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * ST request asks for information about the server's operating system. The
 * server accepts this request with code 215. Examples from five different
 * servers:
 *
 *     215 UNIX Type: L8
 *     215 UNIX Type: L8 Version: BSD-44
 *     215 NetWare system type.
 *     215 MACOS Peter's Server
 *     215 AmigaOS
 *
 * RFC 959 requires that the first word of the response text be a system type
 * registered with IANA, but some servers violate this requirement.
 *
 * Many clients misuse SYST as a declaration of server features. Some clients
 * behave in rather strange ways when they see particular strings in the SYST
 * response. Some clients disable essential features when they do not see
 * particular strings in the SYST response; this poses a serious problem for
 * servers. It is recommended that all new servers respond to SYST with the
 * meaningless string
 *
 *     215 UNIX Type: L8
 *
 * exactly as used by the majority of current servers.
 */
command.add('SYST', 'SYST (returns system type)', function (parameters, commandChannel) {
  commandChannel.write(215, 'UNIX Type: L8');
});
