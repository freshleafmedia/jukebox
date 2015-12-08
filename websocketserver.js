var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var resolve_list = 'resolve_list';

var songCacheFile = 'songcache.json';
var songQueueFile = 'songqueue.json';
var songCache = {};
var songQueue = [];

fs.readFile(songCacheFile, function(err, f) {
    var songCacheJson = f.toString();
    songCache = JSON.parse(songCacheJson);
});

fs.readFile(songQueueFile, function(err, f) {
    var songQueueJson = f.toString();
    songQueue = JSON.parse(songQueueJson);
});

function control(action) {
    process.exec('./control.sh '+action);
}

function commitCache() {
    fs.writeFile('songcache.json', JSON.stringify(songCache));
}

function queueSong(song) {

    console.log(song.id+': Adding to the queue');

    songQueue.push(song);
    fs.writeFile('songqueue.json', JSON.stringify(songQueue));

    io.emit('newsong', song);
}

io.on('connection', function(socket){
    console.log('User connected');

    socket.emit('queuelist', songQueue);

    socket.on('addsong', function(song) {

        console.log(song.id+': Resolving...');

        // Check if we have already resolved this songs ID
        if (typeof songCache[song.id] !== 'undefined' && typeof songCache[song.id]['URL'] !== 'undefined') {
            console.log(song.id+': Already resolved. Using cached URL');
            queueSong(song);
            return;
        }

        // Set the songs state to resolving
        song['state'] = 'resolving';

        // Add the the song to the cache
        songCache[song.id] = song;
        commitCache();

        // Run the resolver
        process.exec('./resolve.sh '+song.id, function (error, stdout, stderr) {

            if (error !== null) {
                console.error(song.id+': Failed to resolve!');
                song['state'] = 'failed';
                commitCache();
                return;
            }

            // The resolve.sh will return the URL
            song['URL'] = stdout;
            song['state'] = 'resolved';
            commitCache();

            console.log(song.id+': Resolved!');
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

