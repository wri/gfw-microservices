# SSL Installation Instructions

## Overview
The current SSL is setup via letsencrypt. As Letsencrypt needs a real server to be able to install, verify and renew, the certificates are originally generated via apache on the actual staging server and then copied over into this directory to be available via Docker.

The original certificates are stored at:

** /etc/letsencrypt/live/pro-staging.globalforestwatch.org**

** NOTE: ** In order to access the certificates directory you have to switch to the root user as the folder is inaccessible via the default ubuntu user.

The following files are found in the directory:
* **privkey.pem**: This is the private key file (only to be stored on the appropriate web server).
* **cert.pem**: This is the public key file.
* **chain.pem**: Your intermediate certificate key file.  
* **fullchain.pem**: A concatenation of your cert and chain key files.

The files that are important for you are privkey.pem and cert.pem. Each file corresponds to your gfwpro.key (private key file) gfwpro.crt (public certificate) respectively.

## Updating Certificates
To update the certificates via Apache on the staging server, you need to:
1. Stop all Docker containers
2. Start the apache web server to allow letsencrypt to verify certificate:

  ** *sudo apache2ctl start* **  
3. Confirm the web server is running by hitting the DNS on a web browser (via HTTP only).
4. change your user to root by using * **sudo su** * if you have already not done so.
5. Run the update command to update the letsencrypt certificate.

  ** *sudo certbot renew* **  
6. Once the certificate has been renewed, copy the cert.pem and privkey.pem from

  */etc/letsencrypt/live/pro-staging.globalforestwatch.org/*

  to

  */home/ubuntu/*

  folder so you can copy them locally.
7. Once the two files are copied into the ubuntu home directory, change the ownership of both files with the following commands:

  ** *chown ubuntu:ubuntu cert.pem* **

  ** *chown ubuntu:ubuntu privkey.pem* **
8. Stop the apache server with:

** *sudo apache2ctl stop* **  
9. Logout of the server, and copy the two files locally using scp"
10. Once the files are copied locally, replace the contents of the existing gfwpro.crt and gfwpro.key files with the new files contents.
