List of FTP Commands
====================

Below is a list of FTP commands that may be sent to an FTP server and their implementation status, including all commands that are standardized in [RFC 959](http://tools.ietf.org/html/rfc959) by the IETF. All commands below are [RFC 959](http://tools.ietf.org/html/rfc959) based unless stated otherwise.

| Status | Command | RFC | Description |
| ------ | ------- | --- | ----------- |
| Implemented | ABOR | | Abort an active file transfer. |
| Not Implemented | ACCT |  | Account information. |
| Not Implemented | ADAT | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Authentication/Security Data |
| Obsolete | ALLO |  | Allocate sufficient disk space to receive a file. |
| Implemented | APPE |  | Append. |
| Not Implemented | AUTH | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Authentication/Security Mechanism |
| Not Implemented | CCC | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Clear Command Channel |
| Implemented | CDUP |  | Change to Parent Directory. |
| Implemented | CONF | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Confidentiality Protection Command |
| Implemented | CWD |  | Change working directory. |
| Implemented | DELE |  | Delete file. |
| Not Implemented | ENC | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Privacy Protected Channel |
| Not Implemented | EPRT | [RFC 2428](http://tools.ietf.org/html/rfc2428) | Specifies an extended address and port to which the server should connect. |
| Not Implemented | EPSV | [RFC 2428](http://tools.ietf.org/html/rfc2428) | Enter extended passive mode. |
| Implemented | FEAT | [RFC 2389](http://tools.ietf.org/html/rfc2389) | Get the feature list implemented by the server. |
| Implemented | HELP |  | Returns usage documentation on a command if specified, else a general help document is returned. |
| Not Implemented | LANG | [RFC 2640](http://tools.ietf.org/html/rfc2640) | Language Negotiation |
| Implemented | LIST |  | Returns information of a file or directory if specified, else information of the current working directory is returned. |
| Not Implemented | LPRT | [RFC 1639](http://tools.ietf.org/html/rfc1639) | Specifies a long address and port to which the server should connect. |
| Not Implemented | LPSV | [RFC 1639](http://tools.ietf.org/html/rfc1639) | Enter long passive mode. |
| Implemented | MDTM | [RFC 3659](http://tools.ietf.org/html/rfc3659) | Return the last-modified time of a specified file. |
| Not Implemented | MIC | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Integrity Protected Command |
| Implemented | MKD |  | Make directory. |
| Implemented | MLSD | [RFC 3659](http://tools.ietf.org/html/rfc3659) | Lists the contents of a directory if a directory is named. |
| Implemented | MLST | [RFC 3659](http://tools.ietf.org/html/rfc3659) | Provides data about exactly the object named on its command line, and no others. |
| Obsolete | MODE |  | Sets the transfer mode (Stream, Block, or Compressed). |
| Implemented | NLST |  | Returns a list of file names in a specified directory. |
| Implemented | NOOP |  | No operation (dummy packet; used mostly on keepalives). |
| Incomplete | OPTS | [RFC 2389](http://tools.ietf.org/html/rfc2389) | Select options for a feature. |
| Implemented | PASS |  | Authentication password. |
| Implemented | PASV |  | Enter passive mode. |
| Not Implemented | PBSZ | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Protection Buffer Size |
| Implemented | PORT |  | Specifies an address and port to which the server should connect. |
| Implemented | PROT | [RFC 2228](http://tools.ietf.org/html/rfc2228) | Data Channel Protection Level. |
| Implemented | PWD |  | Print working directory. Returns the current directory of the host. |
| Implemented | QUIT |  | Disconnect. |
| Implemented | REIN |  | Re initializes the connection. |
| Implemented | REST |  | Restart transfer from the specified point. |
| Implemented | RETR |  | Transfer a copy of the file |
| Implemented | RMD |  | Remove a directory. |
| Implemented | RNFR |  | Rename from. |
| Implemented | RNTO |  | Rename to. |
| Implemented | SITE |  | Sends site specific commands to remote server. |
| Implemented | SIZE | [RFC 3659](http://tools.ietf.org/html/rfc3659) | Return the size of a file. |
| Obsolete | SMNT |  | Mount file structure. |
| Incomplete | STAT |  | Returns the current status. |
| Implemented | STOR |  | Accept the data and to store the data as a file at the server site |
| Implemented | STOU |  | Store file uniquely. |
| Obsolete | STRU |  | Set file transfer structure. |
| Implemented | SYST |  | Return system type. |
| Implemented | TYPE |  | Sets the transfer mode (ASCII/Binary). |
| Implemented | USER |  | Authentication username. |
| Implemented | XCUP | [RFC 775](http://tools.ietf.org/html/rfc775) | Change to the parent of the current working directory |
| Implemented | XMKD | [RFC 775](http://tools.ietf.org/html/rfc775) | Make a directory |
| Implemented | XPWD | [RFC 775](http://tools.ietf.org/html/rfc775) | Print the current working directory |
| Not Implemented | XRCP | [RFC 743](http://tools.ietf.org/html/rfc743) |  |
| Not Implemented | XRMD | [RFC 775](http://tools.ietf.org/html/rfc775) | Remove the directory |
| Not Implemented | XRSQ | [RFC 743](http://tools.ietf.org/html/rfc743) |  |
| Not Implemented | XSEM | [RFC 737](http://tools.ietf.org/html/rfc737) | Send, mail if cannot |
| Not Implemented | XSEN | [RFC 737](http://tools.ietf.org/html/rfc737) | Send to terminal |

See Also
--------

* [IANA FTP Commands and Extensions registry](http://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml) - The official registry of FTP Commands and Extensions