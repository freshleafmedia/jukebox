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

        console.log(song.id+': Resolving...');

        // Check if we have already resolved this songs ID
        if (typeof songCache[song.id] !== 'undefined' && typeof songCache[song.id]['URL'] !== 'undefined') {

            console.log(song.id+': Already resolved. Using cache');
            queueSong(song);
            return;
        }

        // Set the songs state to resolving
        song['state'] = 'resolving';
        commitCache();

        // Add the the song to the cache
        songCache[song.id] = song;

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

            console.log(song.id+': Resolved! Adding to the queue...');
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

