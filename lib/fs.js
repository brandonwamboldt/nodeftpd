// Dependencies
var _    = require('lodash');
var fs   = require('fs');
var path = require('path');

// Since we use a subprocess architecture, we can set the chroot home for the
// entire process
var chrootHome = '/';

// Constructor
var FsModule = function () { };

// Inherit functionality from the default fs module as we don't need to override
// every single method.
FsModule.prototype = fs;
module.exports = exports = new FsModule();

// Set the chroot directory
exports.setChrootHome = function (ch) {
  chrootHome = ch;
};

// Resolve a path to an absolute path (prepends the chroot home directory)
exports.resolve = function (filename) {
  // Make sure filename starts with a /
  if (filename[0] !== '/') {
    filename = '/' + filename;
  }

  filename = path.normalize(chrootHome + filename);

  // Make sure we have a valid filename
  if (filename.substring(0, chrootHome.length) !== chrootHome) {
    filename = chrootHome;
  }

  return filename;
};

// Take an actual absolute path and remove the chroot home directory
exports.unresolve = function (path) {
  if (chrootHome === '/') {
    return path;
  } else {
    path = path.replace(chrootHome, '');
    return (path === '' ? '/' : path);
  }
};

// Chroot compatible functions for the fs module
var resolveAndPassThruOnePathArg = function (func) {
  return function () {
    arguments[0] = exports.resolve(arguments[0]);
    return fs[func].apply(fs[func], arguments);
  };
};

var resolveAndPassThruTwoPathArg = function (func) {
  return function () {
    arguments[0] = exports.resolve(arguments[0]);
    arguments[1] = exports.resolve(arguments[1]);
    return fs[func].apply(fs[func], arguments);
  };
};

_.map([
  'appendFile',
  'appendFileSync',
  'chmod',
  'chmodSync',
  'chown',
  'chownSync',
  'exists',
  'existsSync',
  'lchmod',
  'lchmodSync',
  'lchown',
  'lchownSync',
  'lstat',
  'lstatSync',
  'mkdir',
  'mkdirSync',
  'open',
  'openSync',
  'readdir',
  'readdirSync',
  'readFile',
  'readFileSync',
  'readlink',
  'readlinkSync',
  'realpath',
  'realpathSync',
  'rmdir',
  'rmdirSync',
  'stat',
  'statSync',
  'truncate',
  'truncateSync',
  'unlink',
  'unlinkSync',
  'unwatchFile',
  'utimes',
  'utimesSync',
  'watchFile',
  'writeFile',
  'writeFileSync',
], function (func) {
  exports[func] = resolveAndPassThruOnePathArg(func);
});

_.map([
  'rename',
  'renameSync',
  'symlink',
  'symlinkSync',
], function (func) {
  exports[func] = resolveAndPassThruTwoPathArg(func);
});
