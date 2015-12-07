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

io.on('connection', function(socket){
    console.log('a user connected');

    fs.readFile(resolve_list, function(err, f){
        var queue = f.toString().split('\n');
	queue = queue.map(function(item) {
            if(item != "") {
	        return songCache[item] || { id: item, title: 'Unknown' };
            }
	});
        socket.emit('queuelist', queue);
    });

    socket.on('addsong', function(song) {
        fs.appendFile(resolve_list, song.id + "\n", function (err) {
            console.log('song added: ' + song.id);
	    songCache[song.id] = song;
	    commitCache();
            io.emit('newsong', song);
        });
    });
    socket.on('pause', function() {
        control('pause');
    });
    socket.on('play', function() {
        control('play');
    });
});

