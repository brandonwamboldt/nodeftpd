'use strict';

// Local dependencies
var command = require('../lib/command');
var channel = require('../lib/datachannel');
var fs      = require('../lib/fs');

/**
 * A LIST or NLST request asks the server to send the contents of a directory
 * over the data connection already established by the client. The directory is
 * identified by the current name prefix.
 *
 * Normally the server responds with a mark using code 150. It then stops
 * accepting new connections, attempts to send the contents of the directory
 * over the data connection, and closes the data connection. Finally it
 *
 *   - accepts the LIST or NLST request with code 226 if the entire directory
 *     was successfully transmitted;
 *   - rejects the LIST or NLST request with code 425 if no TCP connection was
 *     established;
 *   - rejects the LIST or NLST request with code 426 if the TCP connection was
 *     established but then broken by the client or by network failure; or
 *   - rejects the LIST or NLST request with code 451 if the server had trouble
 *     reading the directory from disk.
 *
 * The server may reject the LIST or NLST request (with code 450 or 550) without
 * first responding with a mark. In this case the server does not touch the data
 * connection.
 *
 * Directory format
 * ----------------
 *
 * A directory is a list of files. It typically includes a name, type, size, and
 * modification time of each file. The difference between LIST and NLST is that
 * NLST returns a compressed form of the directory, showing only the name of
 * each file, while LIST returns the entire directory.
 *
 * The NLST format consists of a sequence of abbreviated pathnames. Each
 * pathname is terminated by \015\012, without regard to the current binary
 * flag. If an abbreviated pathname starts with a slash, it represents the
 * pathname obtained by replacing each \000 by \012. If an abbreviated pathname
 * does not start with a slash, it represents the pathname obtained by
 * concatenating
 *
 *   - the pathname of the directory;
 *   - a slash, if the pathname of the directory does not end with a slash; and
 *   - the abbreviated pathname, with each \000 replaced by \012.
 *
 * For example, if a directory /pub produces foo\015\012bar\015\012 under NLST,
 * it refers to the pathnames /pub/foo and /pub/bar.
 *
 * The LIST format varies widely from server to server. The most common format
 * is /bin/ls format, which is difficult to parse with even moderate
 * reliability. This poses a serious problem for clients that need more
 * information than names.
 *
 * LIST parameters
 * ---------------
 *
 * LIST and NLST have an optional parameter giving an encoded pathname of a
 * file. The file may be either a directory or a regular file.
 *
 * If the file is a regular file, the server provides information about that
 * file, in the same format as a single directory entry. However, if the file is
 * a directory, most servers will provide the contents of the directory, rather
 * than information about the directory. If the client says NLST x, for example,
 * and the response is x\015\012, then x could be a directory containing one
 * file x, or it could be a regular file; the client can't tell. This
 * inconsistency makes LIST and NLST parameters useless for most applications.
 *
 * I recommend that servers always respond to a nonempty LIST parameter with
 * information about the file, whether the file is a regular file or a
 * directory; this is helpful for some types of indexing clients. I also
 * recommend that servers reject NLST for regular files, and always respond to
 * NLST with directory contents.
 *
 * LIST wildcards
 * --------------
 *
 * Traditional UNIX FTP servers allow the LIST parameter to name several files.
 * For example, the parameter *.ps *.ps.gz refers to every file in the current
 * directory whose name ends with .ps or .ps.gz. The server returns information
 * about each regular file and the contents of each directory, in a format even
 * more difficult to parse than the usual /bin/ls format.
 *
 * Traditional UNIX FTP servers also allow the LIST parameter to specify options
 * for the UNIX /bin/ls program. For example, the parameter -t *.c produces a
 * list of .c files, sorted in decreasing order of modification time.
 *
 * High-quality clients do not attempt to use these features. File selection and
 * sorting are user-interface features that can and should be handled by the
 * client.
 */
command.add('LIST', 'LIST [<sp> pathname]', function (pathname, commandChannel, session) {
  // Create a new data channel
  var success = channel.create(session, function (socket, done) {
    // Read in the files/directories in the user's current working
    // directory
    fs.readdir(fs.toAbsolute(pathname, session.cwd), function (err, files) {
      if (files === null) {
        files = [];
      }

      for (var i = 0; i < files.length; i++) {
        var stat   = fs.statSync(session.cwd + '/' + files[i]);
        var date   = stat.mtime;
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var mode   = '';
        var omode  = parseInt(stat.mode.toString(8), 10);
        omode      = omode.toString().substr(omode.toString().length - 3);

        if (stat.isFile()) {
          mode += '-';
        } else {
          mode += 'd';
        }

        for (var j = 0; j < 3; j++) {
          if (omode[j] === '0') {
            mode += '---';
          } else if (omode[j] === '1') {
            mode += '--x';
          } else if (omode[j] === '2') {
            mode += '-w-';
          } else if (omode[j] === '3') {
            mode += '-wx';
          } else if (omode[j] === '4') {
            mode += 'r--';
          } else if (omode[j] === '5') {
            mode += 'r-x';
          } else if (omode[j] === '6') {
            mode += 'rw-';
          } else if (omode[j] === '7') {
            mode += 'rwx';
          }
        }

        socket.write(mode + ' 1 ' + stat.uid + ' ' + stat.gid + '  ' + stat.size + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + ' ' + files[i] + '\n');
      }

      commandChannel.write(226, 'Directory sent OK.');

      done();
    });
  });

  if (!success) {
    commandChannel.write(425, 'Unable to build data connection: Invalid argument');
  } else {
    commandChannel.write(150, 'Here comes the directory listing.');
  }
});
