'use strict';

// Local dependencies
var command = require('../lib/command');

/**
 * An ACCT request has a parameter called an account name. The client must not
 * send an ACCT request except immediately after a PASS request.
 *
 * The server may accept ACCT with code 230, meaning that permission to access
 * files under this username has been granted; or with code 202, meaning that
 * permission was already granted in response to USER or PASS. The server may
 * reject ACCT with code 503 if the previous request was not PASS or with code
 * 530 if the username, password, and account name are jointly unacceptable.
 *
 * It is not recommended that servers ask for ACCT. Many clients support only
 * USER and PASS, and will give up if ACCT is required. Many other clients will
 * send a useless ACCT noaccount.
 */
command.add('ACCT', 'ACCT is not implemented', function (nil, commandChannel) {
  commandChannel.write(502, 'ACCT command not implemented');
});
