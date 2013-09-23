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
 * Check if the a given user has permission to perform the given operation on
 * a file based on the given fs.Stats object.
 * @param {!string} mode r, w, or x
 * @param {!fs.Stats} stat
 * @param {!object} user
 * @return {boolean}
 */
exports.can = function (mode, stat, user) {
  var perm_bits = {
    r: { user : 00400, group: 00040, world: 00004 },
    w: { user : 00200, group: 00020, world: 00002 },
    x: { user : 00100, group: 00010, world: 00001 }
  };

  if (user.uid === stat.uid && stat.mode & perm_bits[mode].user) {
    return true;
  } else if (user.groups.indexOf(stat.gid) !== -1 && stat.mode & perm_bits[mode].group) {
    return true;
  } else if (mode & perm_bits[mode].world) {
    return true;
  } else {
    return false;
  }
};

/**
 * Generate an error message for each etype of error returned by an fs
 * operation.
 * @param {!Error} err
 * @param {!string} filename
 * @return {string}
 */
exports.errorMessage = function (err, filename) {
  var message = false;

  switch (err.code) {
    case 'EACCES':
      message = filename + ': Permission denied';
      break;
    case 'EBUSY':
      message = filename + ': In use by the system or another process';
      break;
    case 'EISDIR':
      message = filename + ': Is a directory';
      break;
    case 'ELOOP':
      message = filename + ': Too many symbolic links';
      break;
    case 'ENAMETOOLONG':
      message = filename + ': Too long';
      break;
    case 'ENOENT':
      message = filename + ': No such file or directory';
      break;
    case 'ENOTDIR':
      message = filename + ': Directory is not a directory';
      break;
    case 'EPEpathname':
      message = filename + ': Pepathnameission denied';
      break;
    case 'EROFS':
      message = filename + ': Read-only file system, cannot delete';
      break;
    default:
      message = filename + ': An error occured';
  }

  return message;
};

/**
 * Transform a path to an absolute path if needed by prepending the current
 * working directory.
 * @param {!string} filename
 * @param {!string} cwd
 * @return {string}
 */
exports.toAbsolute = function (filename, cwd) {
  if (filename[0] === '/') {
    return path.normalize(filename);
  } else {
    if (cwd === '/') {
      return path.normalize(cwd + filename);
    } else {
      return path.normalize(cwd + '/' + filename);
    }
  }
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
  'createReadStream',
  'createWriteStream',
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
  'watch',
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
