var express = require('express');
var app = express();
var logger = require('morgan');
var fs = require('fs');
var dir = require('node-dir');
var id3 = require('id3js');
var async = require('async');
var swig = require('swig');
var session = require('express-session');
var watchr = require('watchr');

app.use(session({
    secret: '1234567890QWERTY',
    resave: false,
    saveUninitialized: true
}));

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.static('public/audiojs'));

var absoluteDir = __dirname + '/public/music/';
var relativeDir = 'public/music/';

var folders = (function(absoluteDir) {
    files = fs.readdirSync(absoluteDir);
    var dirs = [];
    for (i = 0; i < files.length; i++) {
        if (files[i][0] !== '.') {
            filePath = absoluteDir + '/' + files[i];
            stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                dirs.push(files[i]);
            }
        }
    }
    return dirs;
})(absoluteDir);

var playlists = [];

function newPlaylist(folder, callback) {
    var playlist = [];

    dir.files(relativeDir + folder, function(err, files) {
        if (err) {
            callback('Files error : ' + err, null);
        } else {
            async.each(files, function(file, call) {
                id3({
                    file: file,
                    type: id3.OPEN_LOCAL
                }, function(error, tags) {
                    if (error) {
                        call('ID3 error : ' + error);
                    } else {
                        playlist.push({
                        // We slice to remove the "public" in the uri
                            path: file.slice(6),
                            artist: tags.artist,
                            title: tags.title ? tags.title : file.split('/')[3]
                        });
                        console.log(file);
                        call();
                    }
                });
            }, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, playlist);
                }
            });
        }
    });
}


async.each(folders, function(item, callback) {
    newPlaylist(item, function(err, data) {
        if (err) {
            callback(err);
        }
        playlists.push({
            folder: item,
            playlist: data
        });
        callback();
    });
}, function(err) {
    app.listen(2000);
});

watchr.watch({path: absoluteDir, listener: function(changeType, fullPath, currentStat, previousStat) {
    folder = fullPath.split('/')[6];
    console.log(folder);
    newPlaylist(folder, function(err, playlist){
        if(!err) {
            playlists[searchInArray(playlists, folder)].playlist = playlist;
        }
    });
}});

app.get('/', function(req, res) {
    if (req.query.folder) {
        req.session.folder = req.query.folder;
    }
    if (!req.session.folder) {
        req.session.folder = folders[0];
    }
    res.render('player', {
        playlist: playlists[searchInArray(playlists, req.session.folder)].playlist,
        currentFolder: req.session.folder,
        folders: folders
    });
});

function replaceInArray(array, folder, playlist, callback) {
    for (i = 0; i < array.length; i++) {
        if (array[i].folder == folder) {
            if (playlist != null) {
                array[i].playlist = playlist;
            }
            break;
        }
    }
    callback();
}

function searchInArray(array, folder) {
    for (i = 0; i < array.length; i++) {
        if (array[i].folder == folder) {
            return i;
        }
    }
    return null;
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

