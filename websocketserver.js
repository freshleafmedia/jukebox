var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var playerState = 'stopped';

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

if(songQueue.length > 0) {
    playSong(songQueue[0]);
}

function control(action) {
    process.exec('./control.sh '+action);
}

function commitCache() {
    fs.writeFile(songCacheFile, JSON.stringify(songCache));
}

function commitQueue() {
    fs.writeFile(songQueueFile, JSON.stringify(songQueue));
}

function playSong(song) {

    playerState = 'playing';

    console.log(song.id+': Playing');

    // Run the player
    process.exec('./play.sh "'+song.url+'"', function (error, stdout, stderr) {

        if (error !== null) {
            console.error(song.id+': Failed to play!');
            return;
        }

        // Remove from the queue
        delete songQueue[song.id];
        commitQueue();

        console.log(song.id+': Finished!');

        // Keep playing
        if (typeof songQueue[0] !== 'undefined') {
            playSong(songQueue[0]);
            return;
        }

        playerState = 'stopped';
    });
}

function queueSong(song) {

    console.log(song.id+': Adding to the queue');

    songQueue.push(song);
    commitQueue();

    io.emit('newsong', song);

    if (playerState === 'stopped') {
        playSong(song);
    }
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
                songCache[song.id]['state'] = 'failed';
                commitCache();
                return;
            }

            // The resolve.sh will return the URL
            songCache[song.id]['URL'] = stdout;
            songCache[song.id]['state'] = 'resolved';
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

