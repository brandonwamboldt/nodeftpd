NodeFTPD
========

NodeFTPD is an FTP server written for Node.js. It's currently in **alpha** and is not recommended for use in any environments. 

The project is a Node.js/JavaScript learning project, but I intend on making it into a feature complete FTP server that I can deploy on my own servers.

Installation
------------

This software is in **alpha**. It's **NOT** ready for use in any type of production environment. However, if you want to install it and take a look around, just git clone it, and run `node app.js`. It will auto detect your IP and run on port 21. 

Configuration
-------------

The configuration file is `/etc/nodeftpd.conf`. It expects a JSON file. Example configuration below:

```
{
    "port": 21,
    "listen": "127.0.0.1"
}
```