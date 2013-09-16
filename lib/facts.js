var fs      = require('./fs');
var moment  = require('moment');

exports.unique = function (stat) {
  return stat.dev.toString(16) + 'U' + stat.ino.toString(16);
};

exports.modify = function (stat) {
  return moment(stat.mtime).format('YYYYMMDDHHmmss');
};

/**
 * Generate the contents of the 'perm' fact.
 * @param {!fs.Stats} stats
 * @param {!object} user
 * @return {string}
 */
exports.perm = function (stats, user) {
  var perm = '';

  // The "a" permission applies to objects of type=file, and indicates that the
  // APPE (append) command may be applied to the file named.
  if (!stats.isDirectory() && fs.can('w', stats, user)) {
    perm += 'a';
  }

  // The "c" permission applies to objects of type=dir (and type=pdir,
  // type=cdir).  It indicates that files may be created in the directory named.
  // That is, that a STOU command is likely to succeed, and that STOR and APPE
  // commands might succeed if the file named did not previously exist, but is
  // to be created in the directory object that has the "c" permission.  It also
  // indicates that the RNTO command is likely to succeed for names in the
  // directory.
  if (stats.isDirectory() && fs.can('w', stats, user)) {
    perm += 'c';
  }

  // The "d" permission applies to all types.  It indicates that the object
  // named may be deleted, that is, that the RMD command may be applied to it if
  // it is a directory, and otherwise that the DELE command may be applied to
  // it.
  if (fs.can('w', stats, user)) {
    perm += 'd';
  }

  // The "e" permission applies to the directory types.  When set on an object
  // of type=dir, type=cdir, or type=pdir it indicates that a CWD command naming
  // the object should succeed, and the user should be able to enter the
  // directory named.  For type=pdir it also indicates that the CDUP command may
  // succeed (if this particular pathname is the one to which a CDUP would
  // apply.)
  if (stats.isDirectory() && fs.can('x', stats, user)) {
    perm += 'e';
  }

  // The "f" permission for objects indicates that the object named may be
  // renamed - that is, may be the object of an RNFR command.
  if (fs.can('w', stats, user)) {
    perm += 'f';
  }

  // The "m" permission applies to directory types, and indicates that the
  // MKD command may be used to create a new directory within the
  // directory under consideration.
  if (stats.isDirectory() && fs.can('w', stats, user)) {
    perm += 'm';
  }

  // The "p" permission applies to directory types, and indicates that objects
  // in the directory may be deleted, or (stretching naming a little) that the
  // directory may be purged.  Note: it does not indicate that the RMD command
  // may be used to remove the directory named itself, the "d" permission
  // indicator indicates that.
  if (stats.isDirectory() && fs.can('w', stats, user)) {
    perm += 'p';
  }

  // The "r" permission applies to type=file objects, and for some
  // systems, perhaps to other types of objects, and indicates that the
  // RETR command may be applied to that object.
  if (fs.can('r', stats, user)) {
    perm += 'r';
  }

  // The "w" permission applies to type=file objects, and for some systems,
  // perhaps to other types of objects, and indicates that the STOR command may
  // be applied to the object named.
  if (fs.can('w', stats, user)) {
    perm += 'w';
  }

  return perm;
};
