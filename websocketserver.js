var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var resolve_list = 'resolve_list';

var songCache = {};

fs.readFile('songcache.json', function(err, f) {
    songCacheJson = f.toString();
    songCache = JSON.parse(songCacheJson);
});

function control(action) {
    process.exec('./control.sh '+action);
}

function commitCache() {
    fs.writeFile('songcache.json', JSON.stringify(songCache));
}

function queueSong(song) {
    io.emit('newsong', song);
}

io.on('connection', function(socket){
    console.log('a user connected');

    fs.readFile(resolve_list, function(err, f){
        var queue = f.toString().split('\n');

        queue = queue.filter(function(item) {
            return item;
        });

        queue = queue.map(function(item) {
            return songCache[item] || { id: item, title: 'Unknown', thumbnail: '' };
        });

        socket.emit('queuelist', queue);
    });

    socket.on('addsong', function(song) {

        console.log('Resolving '+song.id);

        // Check if we have already resolved this songs ID
        if (typeof songCache[song.id] !== 'undefined' && typeof songCache[song.id]['URL'] !== 'undefined') {
            queueSong(song);
            return;
        }

        process.exec('./resolve.sh '+song.id, function (error, stdout, stderr) {
            console.log('stderr: ' + stderr);
            console.log('stdout: ' + stdout);

            if (error !== null) {
                console.log('exec error: ' + error);
                return;
            }

            // The resolve.sh will return the URL
            song['URL'] = stdout;
            songCache[song.id] = song;

            commitCache();
            queueSong(song);
        });
    });
    socket.on('pause', function() {
        control('pause');
    });
    socket.on('play', function() {
        control('play');
    });
});

