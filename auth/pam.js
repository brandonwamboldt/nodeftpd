// Dependencies
var auth   = require('../lib/auth');
var config = require('../lib/config');
var fs     = require('../lib/fs');
var pam    = require('authenticate-pam');

// Register our authentication mechanism
auth.register('pam', function (username, password, done) {
  pam.authenticate(username, password, function (err) {
    if (err) {
      done(err, null);
    } else {
      fs.readFile('/etc/passwd', { encoding: 'UTF-8' }, function (err, data) {
        var userDetails = data.match(new RegExp('^(' + username + '.*)', 'im'))[1].split(':');

        var user = {
          username: username,
          password: password,
          chroot: config.get('auth.chroot') === '~' ? userDetails[5] : config.get('auth.chroot')
        };

        user.home = fs.unresolve(userDetails[5], user.chroot);

        done(err, user);
      });
    }
  });
});
