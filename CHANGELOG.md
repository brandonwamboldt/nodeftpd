Changelog
=========

0.3.1
-----

* ENHANCEMENT - Make sure we are being run as root
* FIX - Defer log directory creation to the main process to avoid errors during installation. Fixes issue #3.

0.3.0
-----

* Reworked passive mode transfers to request a port number from the supervisor process in order to properly maintain state (which ports are in use). This fixes a bug with multiple concurrent downloads.
* Passive ports are generated randomly instead of sequentially to fix possible exploits.

0.2.4
-----

* ENHANCEMENT - Added a `-D`/`--no-daemon` option to make dev/debugging easier
* FIX - Fix command line arguments

0.2.3
-----

* ENHANCEMENT - Nicer logging for commands & responses
* FIX - Fix a bug in the logger only replacing the first set of color tags

0.2.2
-----

* FIX - Run `start` if `nodeftpd` is called with no arguments
* FIX - Don't restart supervisor.js if it crashes, it should only crash for a good reason
* FIX - Don't crash on `nodeftpd status` if no forever processes are found

0.2.1
-----

* Fix install error caused by making the log directory

0.2.0
-----

* Run as a daemon using Forever now
* Log to files
* UID/GID support - The process now uses `setuid()`/`setgid()`
* Refuse to install on `win32`
* Use writable streams for `STOR`
* `STAT` is implemented
* `MLST` is implemented (But not `MLSD`)
* `MODE` is implemented (fake implementation)
* FIX - Show file errors before the upload starts for `STOR`
* FIX - Catch errors in data channels to avoid cluttering error logs
* FIX - Better errors for `RMD`
* FIX - Don't log passwords

0.1.0
-----

* Initial stable version, most common functionality implemented
* Basic PAM authentication
* Chroot jail support
