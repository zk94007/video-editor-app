# bb-server

bb-server is a back-end server for blurbiz client web application.

  - Node.js
  - PostgreSQL
  - Socket
  
## Installation

bb-server requires 

 - Node.js v8+
 - PostgreSQL v9.3+
 - FFMpeg v3.0+
 - GraphicsMagick v1.3+
 - ImageMagick v7.0+
 - gifsicle v1.9+
 
 
### Install PostgreSQL and setup blurbiz2018 database

[PostgreSQL](https://www.postgresql.org/download)

Setup blurbiz2018 from backup_2018_05_02.backup


### Install FFMpeg

[FFMpeg](https://www.ffmpeg.org/download.html)


### Install GraphicsMagick

[GraphicsMagick](http://www.graphicsmagick.org/download.html)


### Install ImageMagick

[ImageMagick](https://www.imagemagick.org/script/download.php)

### Install gifsicle

[GifSicle for Linux](https://github.com/kohler/gifsicle)

[GifSicle for Windows](http://www.softpedia.com/get/Multimedia/Graphic/Graphic-Editors/Gifsicle.shtml)


### Install the dependencies and devDependencies and start the server.

```sh
$ cd bb-server
$ npm install
$ npm start
```