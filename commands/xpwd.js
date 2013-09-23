// Local dependencies
var command = require('../lib/command');

/**
 * A PWD request asks the server to print the name prefix:
 *
 *     PWD
 *     257 "/home/joe"
 *
 * If the server accepts the PWD request (required code 257), its response
 * consists of exactly one line, with text in the following format:
 *
 *   1. a double quote;
 *   2. the name prefix, with each double quote replaced by a pair of double
 *      quotes, and with \012 encoded as \000;
 *   3. another double quote;
 *   4. a space;
 *   5. useless human-readable information.
 *
 * Many servers fail to check for double quotes in the name prefix. There is no
 * reliable way for the client to compensate for this.
 *
 * Servers are permitted to reject PWD requests with code 550, but high-quality
 * servers will try to accept all PWD requests.
 *
 * RFC 1123 requires that the server treat XPWD as a synonym for PWD.
 */
command.add('PWD', 'PWD (returns current working directory)', function (nil, output, session) {
  var cwd = session.cwd.replace(/"/g, '""');
  cwd     = cwd.replace(/\n/g, '\0');

  output.write(257, '"' + cwd + '"');
});
