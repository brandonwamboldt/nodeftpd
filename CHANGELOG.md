Changelog
=========

0.2.2
-----

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
