'use strict';

// Third party dependencies
var pam = require('authenticate-pam');

// Local dependencies
var auth   = require('../lib/auth');
var config = require('../lib/config');
var unix   = require('../lib/unix');

// Register our authentication mechanism
auth.register('pam', function (username, password, done) {
  pam.authenticate(username, password, function (err) {
    if (err) {
      done(err, null);
    } else {
      var user    = unix.getUser({ username: username })[0];
      user.chroot = config.auth.default_chroot === '~' ? user.home : config.auth.default_chroot;

      done(err, user);
    }
  });
});
