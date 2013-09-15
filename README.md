NodeFTPD
========

NodeFTPD is an FTP server written for Node.js. It's currently under heavy development and should not, under any circumstances, be used in production (or any environment connected to the Internet). It doesn't even support real authentication yet!

It is however, a real FTP server. The bulk of basic FTP features have been implemented, and I'm currently working on authentication and features related to that.

The project is a Node.js/JavaScript learning project, but I intend on making it into a feature complete FTP server that I can deploy on my own servers.

Installation
------------

This software is in **alpha**. It's **NOT** ready for use in any type of production environment.

The PAM dev package is required. On Ubuntu variants, install with 'sudo apt-get install libpam-dev'. On CentOS variants, install with 'sudo yum install pam-devel'.

However, if you want to install it and take a look around, just `git clone` it, run `npm install` to install dependencies and run `npm start`. It will auto detect your IP and run on port 21.

Configuration
-------------

The configuration file is `/etc/nodeftpd.conf`. It expects a JSON file. Example configuration below:

```
{
    "port": 21,
    "listen": "127.0.0.1"
}
```

Authentication Mechanisms
-------------------------

The system only supports Linux accounts via PAM at the moment. More drivers are coming soon!

FTP Documentation
-----------------

* [http://www.nsftools.com/tips/RawFTP.htm](http://www.nsftools.com/tips/RawFTP.htm)
* [http://www.ipswitch.com/support/ws_ftp-server/guide/v5/a_ftpref3.html](http://www.ipswitch.com/support/ws_ftp-server/guide/v5/a_ftpref3.html)

Progress
--------

* ABOR - abort a file transfer
* ACCT - send account information
* APPE - append to a remote file
* ~~CDUP - CWD to the parent of the current directory~~
* ~~CWD - change working directory~~
* ~~DELE - delete a remote file~~
* FEAT - list all new FTP features that the server supports (note: fake implementation for testing purposes)
* ~~HELP - return help on using hte server~~
* ~~LIST - list remote files~~
* ~~MDTM - return the modification time of a file~~
* ~~MKD - make a remote directory~~
* MODE - set transfer mode
* NLST - name list of remote directory
* ~~NOOP - do nothing~~
* PASS - send password (note: fake implemented for testing purposes)
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
* STAT - return server status
* ~~STOR - store a file on the remote host~~
* STOU - store a file uniquely
* STRU - set file transfer structure
* ~~SYST - return system type~~
* ~~TYPE - set the transfer type~~
* USER - send username (note: fake implemented for testing purposes)
