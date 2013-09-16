// Dependencies
var config = require('./config');

// List of authentication mechanisms available
var authMechanisms = {};

exports.register = function (name, verifyCallback) {
  authMechanisms[name] = verifyCallback;
};

exports.exists = function (name) {
  return typeof(authMechanisms[name.toLowerCase()]) !== 'undefined';
};

exports.authenticate = function (username, password, callback) {
  authMechanisms[config.get('auth.mechanism')](username, password, callback);
};
