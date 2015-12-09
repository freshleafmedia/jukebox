var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var playerState = 'stopped';
var paused = false;

var pathCache = './cache';

var songQueueFile = 'songqueue.json';
var songQueue = [];

fs.readFile(songQueueFile, function(err, f) {
    var songQueueJson = f.toString();
    songQueue = JSON.parse(songQueueJson);

    if(songQueue.length > 0) {
        playQueue();
    }
});

function updateControlStatus() {
    io.emit('controlstatus', {
        'paused': (playerState === 'paused')
    });
}

function incrementStat(songID,statName) {
    if (typeof songStats[songID] === 'undefined') {
        songStats[songID] = {};
    }
    if (typeof songStats[statName] === 'undefined') {
        songStats[statName] = 0;
    }

    // Set the stat
    songStats[songID][statName] += 1;

    // Persist
    fs.writeFile(songStatFile, JSON.stringify(songStats));
}

function control(action) {

    if (action === 'skip') {
        process.exec('killall vlc');
        return;
    }
    // Check if were paused
    if (action === 'pause' && playerState === 'paused') {
        return;
    }

    process.exec('./control.sh '+action);

    updateControlStatus();
}

function commitQueue() {
    fs.writeFile(songQueueFile, JSON.stringify(songQueue));
}

function playQueue(startQueueFrom) {

    if(typeof startQueueFrom === 'undefined') {
        startQueueFrom = 0;
    }

    // Check there are some queued songs and that we aren't already playing
    if(songQueue.length === 0 || playerState === 'playing') {
        return;
    }

    // Get the song to play
    var song = songQueue.slice(startQueueFrom,1);

    // Check we found a song
    if (typeof song === 'undefined') {
        return;
    }

    // Check if this song is playable
    if (song.state !== 'resolved') {

        // try and play the next song
        playQueue(startQueueFrom+1);
    }

    if (typeof song.URL === 'undefined') {
        songSetAttribute(song,'state','error');
        songSetAttribute(song,'message','No URL to play');

        console.error(song.id+': ERROR: No URL!');

        // try and play the next song
        playQueue(startQueueFrom+1);
    }

    playerState = 'playing';
    console.log(songID+': Playing');

    songSetAttribute(song,'state','playing');

    // Run the player
    process.exec('./play.sh "'+song.URL+'"', function (error, stdout, stderr) {

        if (error !== null) {
            songSetAttribute(song,'state','failed');
            songSetAttribute(song,'message',error);
            console.error(songID+': Failed to play!');
            return;
        }

        // Remove from queue
        songQueue.shift();

        console.log(songID+': Finished!');

	    io.emit('song finished', song);

        playerState = 'stopped';

        // Keep playing
        playQueue();
    });
}

function songSetAttribute(song, attrName, attrValue) {

    song[attrName] = attrValue;

    var data = {
        'song': song,
        'name': attrName,
        'value': attrValue,
    };

    io.emit('setAttr', data);
}

io.on('connection', function(socket){
    console.log('User connected');

    socket.emit('queuelist', songQueue);

    socket.on('addsong', function(song) {

        console.log(song.id+': Trying to add...');

        // Check if this song is already on the queue
        if (typeof songQueue[song.id] !== 'undefined') {
            console.log(song.id+': Already queued');
            return;
        }

        // Add the song to the queue
        songQueue.push(song.id);
        io.emit('newsong', song);

        // Set the song as resolving
        songSetAttribute(song, 'state', 'resolving');

        // Check if we have already downloaded this song
        if (fs.accessSync(pathCache+'/'+song.id)) {
            songSetAttribute(song, 'state', 'resolved');
            console.log(song.id+': Song in cache, now on the queue...');
            playQueue();
            return;
        }

        console.log(song.id+': Resolving...');

        // Set the songs state to resolving
        songSetAttribute(song, 'state', 'resolving');

        // Run the resolver
        process.exec('./resolve.sh '+song.id, function (error, stdout, stderr) {

            if (error !== null || stdout == '') {
                console.error(song.id+': Failed to resolve!');
                songSetAttribute(song, 'state', 'failed');
                socket.emit('resolve failed', song);
                return;
            }

            // Set the URL and state
            songSetAttribute(song, 'URL', stdout);
            songSetAttribute(song, 'state', 'resolved');

            console.log(song.id+': Resolved!');
            playQueue();
        });
    });
    socket.on('pause', function() {
        control('pause');
    });
    socket.on('play', function() {
        control('play');
    });
    socket.on('skipsong', function() {
        control('skip');
    });

    socket.on('volUp', function() {
        control('volup');
    });

    socket.on('volDown', function() {
        control('voldown');
    });
    updateControlStatus();
});

