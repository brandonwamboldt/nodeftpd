// Dependencies
var auth   = require('../lib/auth');
var config = require('../lib/config');
var fs     = require('../lib/fs');
var rfs    = require('fs');
var _      = require('lodash');
var pam    = require('authenticate-pam');

// Variables
var users = {};
var groups = {};

// Parse and cache /etc/passwd
rfs.readFile('/etc/passwd', { encoding: 'UTF-8' }, function (err, data) {
  if (!err) {
    var _users = data.split('\n');

    _.map(_users, function (userRow) {
      var user = userRow.split(':');

      if (user[0] !== '') {
        users[user[0]] = user;
      }
    });
  }
});

// Parse and cache /etc/group
rfs.readFile('/etc/group', { encoding: 'UTF-8' }, function (err, data) {
  if (!err) {
    var _groups = data.split('\n');

    _.map(_groups, function (groupRow) {
      var group = groupRow.split(':');

      if (group[0] !== '') {
        groups[group[0]] = group;
      }
    });
  }
});

// Register our authentication mechanism
auth.register('pam', function (username, password, done) {
  pam.authenticate(username, password, function (err) {
    if (err) {
      done(err, null);
    } else {
      // Get all of the groups the user is part of
      var userGroups = [parseInt(users[username][3])];

      _.map(groups, function (group) {
        var usersInGroup = group[3].split(',');

        if (usersInGroup.indexOf(username) !== -1) {
          userGroups.push(parseInt(group[2]));
        }
      });

      // Format and return the user data
      var user = {
        uid: parseInt(users[username][2]),
        gid: parseInt(users[username][3]),
        username: username,
        password: password,
        chroot: config.auth.chroot === '~' ? users[username][5] : config.auth.chroot,
        home: users[username][5],
        groups: userGroups
      };

      done(err, user);
    }
  });
});
