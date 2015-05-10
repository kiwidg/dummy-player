# dummy-player
A basic mp3 player with automatic generation of playlists based on the folders.

## Prerequisites

To use it, you will need [Node.js](https://nodejs.org/download/).

Then download the project (as a zip that you extract, or whatever), and `npm install`.

## Configuration

Feel free to change the listening port (by default 2000). 

You then have to create a folder called "music" in the public folder, and put there all your bird songs classified in folders.

Here is an example of the structure :

```
.
├── app.js
├── node_modules
│   └── Created by npm
├── package.json
├── public
│   ├── audiojs
│   │   ├── audiojs.swf
│   │   ├── audio.min.js
│   │   └── player-graphics.gif
│   └── music
│       ├── playlist1
│       │   ├── music1
│       │   └── music2
│       └── playlist2
│           └── music3
├── README.md
└── views
    ├── error.html
    ├── npm-debug.log
    └── player.html
```
### Misc

The mp3 player used is [audio.js](http://kolber.github.io/audiojs/), and the web page is completely based on the example template with playlist.
