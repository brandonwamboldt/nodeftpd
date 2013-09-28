'use strict';

// Third party dependencies
var fs = require('fs');
var _  = require('lodash');

// Cached data
var users  = [];
var groups = [];

/**
 * Get a UNIX user matching the given criteria.
 * @param {!object} where
 * @return {object}
 */
exports.getUser = function (where) {
  return _.where(users, where);
};

/**
 * Get a UNIX group matching the given criteria.
 * @param {!object} where
 * @return {object}
 */
exports.getGroup = function (where) {
  return _.where(groups, where);
};

/**
 * Private methods
 */
(function () {
  var _loadUsers = function (file) {
    fs.readFile(file, { encoding: 'UTF-8' }, function (err, data) {
      if (err) {
        throw new Error('Unable to read ' + file);
      }

      var _users = data.split('\n');

      _.forEach(_users, function (user) {
        user = user.split(':');

        if (user[0] !== '') {
          var userGroups = _.merge(
            _.pluck(
              _.where(groups, { users: [ user[0] ] }),
              'gid'
            ),
            [parseInt(user[3], 10)]
          );

          users.push({
            uid:         parseInt(user[2], 10),
            username:    user[0],
            password:    user[1],
            group:       parseInt(user[3], 10),
            groups:      userGroups,
            home:        user[5],
            shell:       user[6],
            description: user[4]
          });
        }
      });
    });
  };

  var _loadGroups = function (file) {
    fs.readFile(file, { encoding: 'UTF-8' }, function (err, data) {
      if (err) {
        throw new Error('Unable to read ' + file);
      }

      var _groups = data.split('\n');

      _.forEach(_groups, function (group) {
        group = group.split(':');

        if (group[0] !== '') {
          groups.push({
            gid:   parseInt(group[2], 10),
            group: group[0],
            users: group[3].split(',')
          });
        }
      });
    });
  };

  _loadGroups('/etc/group');
  _loadUsers('/etc/passwd');
})();
