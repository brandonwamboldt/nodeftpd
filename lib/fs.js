var fs = require('fs');

module.exports = exports = fs;

exports.resolve = function (chrootHome, path) {
  // Make sure path starts with a /
  if (path[0] !== '/') {
    path = '/' + path;
  }

  // Run realpath on it
  path = fs.realpathSync(chrootHome + path);

  // Make sure we have a valid path
  if (path.substring(0, chrootHome.length) !== chrootHome) {
    path = chrootHome;
  }

  return path;
};


exports.unresolve = function (path, chrootHome) {
  if (chrootHome === '/') {
    return path;
  } else {
    path = path.replace(chrootHome, '');
    return (path === '' ? '/' : path);
  }
};
