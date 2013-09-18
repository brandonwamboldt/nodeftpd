NodeFTPD
========

NodeFTPD is an FTP server written for Node.js. It's currently under heavy development and should not, under any circumstances, be used in production (or any environment connected to the Internet).

It is however, a real FTP server. The bulk of basic FTP features have been implemented, and I'm working on more advanced features like alternative authentication mechanisms and SSL/TLS support (FTPS/FTPES).

The project is a Node.js/JavaScript learning project, but I intend on making it into a feature complete FTP server that I can deploy on my own servers.

Installation
------------

This software is in **alpha**. It's **NOT** ready for use in any type of production environment.

* The **PAM dev** package is required. On Ubuntu variants, install with `sudo apt-get install libpam-dev`. On CentOS variants, install with `sudo yum install pam-devel`. On Debian variants, install with `sudo apt-get install libpam0g-dev`.
* Clone this repository or [download as a zip](https://github.com/brandonwamboldt/nodeftpd/archive/master.zip),
* Run `npm install` to install dependencies
* Run `npm start`. It will auto detect your IP and run on port 21.

Configuration
-------------

The configuration file is `/etc/nodeftpd.conf`. It expects a JSON file. Example configuration below:

```javascript
{
  // The message of the day shown when users connect
  "motd": "",

  // The port to listen on
  "port": 21,

  // Network interface to listen on
  "listen": "127.0.0.1",

  // The authentication mechanism to use (config, mongo, mysql, pam, postgres, redis)
  "auth.mechanism": "pam",

  // Chroot directory (~ is the user's home directory, otherwise use an absolute path)
  "auth.chroot": "~"
}
```

Authentication Mechanisms
-------------------------

The system only supports Linux accounts via PAM at the moment. More drivers are coming soon!

Chrooting
---------

The chroot functionality allows you to set a user's root directory to something other than than `/`, and they will not be able to perform operations on any file or directory outside of their chroot directory. For example, you may wish to set the chroot to `~`, the user's home directory. If the user `brandon` with the home directory `/home/brandon` logs in, he'll see a current working directory of `/`, which will *actually* be `/home/brandon`.

You may also set the chroot path to an absolute pathname, such as `/var/www/html`.

Chrooting is implemented in the code using an abstraction of the `fs` library. This is because the node modules that provide chroot functionality are buggy and unreliable.

Permissions
-----------

When a user authenticates, NodeFTPD sets the UID/GID of the process handling their connection. For the PAM provider, the UID/GID is set to the user's UID/GID.

Architecture
------------

This FTP server uses a child process based design, where each connection is handled by it's own process. This is for security reasons, and to make the code easier to organize and maintain.

The parent process listens for new connections and passes them off to a process in the process pool. When this occurs, a new process is spawned to keep *x* processes free in the pool. When a connection is closed, that process is destroyed.

FTP Documentation
-----------------

* [RFC 3659 - Extensions to FTP](http://tools.ietf.org/html/rfc3659)
* [List of raw FTP commands](http://www.nsftools.com/tips/RawFTP.htm)
* [FTP Commands](http://www.ipswitch.com/support/ws_ftp-server/guide/v5/a_ftpref3.html)

Progress
--------

* ABOR - abort a file transfer
* ACCT - send account information
* APPE - append to a remote file
* ~~CDUP - CWD to the parent of the current directory~~
* ~~CWD - change working directory~~
* ~~DELE - delete a remote file~~
* ~~FEAT - list all new FTP features that the server supports~~
* ~~HELP - return help on using hte server~~
* ~~LIST - list remote files~~
* ~~MDTM - return the modification time of a file~~
* ~~MKD - make a remote directory~~
* ~~MLST - list remote object~~
* ~~MODE - set transfer mode~~
* ~~NLST - name list of remote directory~~
* ~~NOOP - do nothing~~
* ~~PASS - send password~~
* ~~PASV - enter passive mode~~
* ~~PORT - open a data port~~
* ~~PWD - print working directory~~
* ~~QUIT - terminate the connection~~
* ~~REIN - reinitialize the connection~~
* ~~RETR - retrieve a remote file~~
* ~~RMD - remove a remote directory~~
* ~~RNFR - rename from~~
* ~~RNTO - rename to~~
* SITE - site-specific commands (partially implemented)
* ~~SIZE - return the size of a file~~
* ~~STAT - return server status~~
* ~~STOR - store a file on the remote host~~
* STOU - store a file uniquely
* STRU - set file transfer structure
* ~~SYST - return system type~~
* ~~TYPE - set the transfer type~~
* ~~USER - send username~~
