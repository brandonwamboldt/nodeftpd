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

/**
 * Set the chroot jail base directory.
 * @param {!string} ch
 */
exports.setChrootHome = function (ch) {
  chrootHome = ch;
};

/**
 * Take an "absolute" relative to a chroot jail, and prepend the chroot jail
 * path to it, making sure the path doesn't go outside of the chroot jail. For
 * example, /myfile.txt becomes /home/username/myfile.txt, assuming the chroot
 * jail is /home/username.
 * @param {!string} path
 */
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

/**
 * Take a real absolute path and remove the part of the path that is the chroot
 * jail. For example, /home/username/myfile.txt becomes /myfile.txt, assuming
 * the chroot jail is /home/username.
 * @param {!string} path
 */
exports.unresolve = function (filename) {
  if (chrootHome === '/') {
    return filename;
  } else {
    filename = filename.replace(chrootHome, '');
    return (filename === '' ? '/' : filename);
  }
};

/**
 * Resolve a chrooted path by prepending it with the chroot jail home directory
 * and then calling the original fs function with the proper path as an argument
 * @param {!string} func The fs method
 */
var resolveAndPassThruOnePathArg = function (func) {
  return function () {
    arguments[0] = exports.resolve(arguments[0]);
    return fs[func].apply(fs[func], arguments);
  };
};

/**
 * Resolve a chrooted path by prepending it with the chroot jail home directory
 * and then calling the original fs function with the proper path as an argument
 * @param {!string} func The fs method
 */
var resolveAndPassThruTwoPathArg = function (func) {
  return function () {
    arguments[0] = exports.resolve(arguments[0]);
    arguments[1] = exports.resolve(arguments[1]);
    return fs[func].apply(fs[func], arguments);
  };
};

// fs methods that accept a single path argument
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

// fs methods that accept two path arguments
_.map([
  'rename',
  'renameSync',
  'symlink',
  'symlinkSync',
], function (func) {
  exports[func] = resolveAndPassThruTwoPathArg(func);
});
