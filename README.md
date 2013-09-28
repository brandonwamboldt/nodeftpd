NodeFTPD
========

NodeFTPD is an FTP server written for Node.js. It's currently under heavy development and should not be used in production.

This is a real FTP server, and I'm aiming to implement all standard FTP functionality. I have pretty much all of the basics implemented so far, and you can definitely install this locally and use it as an FTP server. It even supports TLS!

The project is a Node.js/JavaScript learning project, but I intend on making it into a feature complete FTP server that I can deploy on my own servers.

Installation
------------

This software is in **alpha**. It's **NOT** ready for use in any type of production environment.

### Latest Code

* The **PAM dev** package is required. On Ubuntu variants, install with `sudo apt-get install libpam-dev`. On CentOS variants, install with `sudo yum install pam-devel`. On Debian variants, install with `sudo apt-get install libpam0g-dev`.
* Clone this repository or [download as a zip](https://github.com/brandonwamboldt/nodeftpd/archive/master.zip)
* Run `npm install` to install dependencies
* Run `npm start`. It will auto detect your IP and run on port 21.

### From NPM

* The **PAM dev** package is required. On Ubuntu variants, install with `sudo apt-get install libpam-dev`. On CentOS variants, install with `sudo yum install pam-devel`. On Debian variants, install with `sudo apt-get install libpam0g-dev`.
* Run `npm install -g nodeftpd`
* Run `nodeftpd start`. It will auto detect your IP and run on port 21.

Commands Line Interface
-----------------------

These instructions assume you've installed NodeFTPD via NPM or placed the NodeFTPD binary in your `PATH` variable.

**Start NodeFTPD**

```
$ nodeftpd start
Starting NodeFTPD.... Done
```

**Stop NodeFTPD**

```
$ nodeftpd stop
Stopping NodeFTPD.... Stopped
```

**Restart NodeFTPD**

```
$ nodeftpd restart
Stopping NodeFTPD.... Not running
Starting NodeFTPD.... Done
```

**NodeFTPD status**

```
$ nodeftpd status
NodeFTPD is NOT running.
```

**Help**

```
$ nodeftpd help

  Usage: nodeftpd [options] [command]

  Commands:

    help                   Show this help text
    status                 Display the status of NodeFTPD
    stop                   Stop NodeFTPD
    restart                Restart NodeFTPD
    *                      Start NodeFTPD

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -D, --no-daemon  Don't run NodeFTPD as a daemon
```

Logs/PID File
-------------

Every FTP command and response is logged. By default, these logs are stored in `/var/log/nodeftpd/access.log`.

Error logs are stored in `/var/log/nodeftpd/error.log`.

The PID file (stores the process ID of the main process) is in `/var/run/nodeftpd.pid`.

You may override these values via the config file.

Configuration
-------------

The configuration file is `/etc/nodeftpd.yml`. It expects a YAML file. Example configuration below:

```yaml
port: 10021
passive_port_range: 45000-55000
motd: 'NodeFTPD %pkg.version% Server (%os.hostname%)'
```

To see all possible configuration values, please look at `config.yml` (contains the default config).

TLS/SSL
-------

### Explicit TLS

This is not yet implemented

### Implicit TLS

**Warning: This feature is new and unstable**

Add the following to your config file:

```yaml
tls:
  enabled: true,
  key: /root/server-key.pem
  cert: /root/server-cert.pem
  port: 990
```

Listens on port 990 by default. Supports active and passive mode transfers.

Authentication Mechanisms
-------------------------

The system only supports Linux accounts via PAM at the moment. More drivers are coming soon!

Architecture
------------

This FTP server uses a child process based design, where each connection is handled by it's own process. This is for security reasons, and to make the code easier to organize and maintain.

The parent process listens for new connections and passes them off to a process in the process pool. When this occurs, a new process is spawned to keep *x* processes free in the pool. When a connection is closed, that process is destroyed.

FTP Implementation Resources
----------------------------

* [RFC 3659 - Extensions to FTP](http://tools.ietf.org/html/rfc3659)
* [List of raw FTP commands](http://www.nsftools.com/tips/RawFTP.htm)
* [FTP Commands](http://www.ipswitch.com/support/ws_ftp-server/guide/v5/a_ftpref3.html)
* [FTP: File Transfer Protocol on cr.yp.to](http://cr.yp.to/ftp.html)

