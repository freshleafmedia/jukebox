var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var JukeBox = function() {
    this.queues = {};
    this.queueID = 0;
    this.state = JukeBox.STATUS_STOPPED;
    this.loadQueue(0);
};

Object.defineProperty(JukeBox, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(JukeBox, "STATUS_STOPPED", { value: 'stopped' });
Object.defineProperty(JukeBox, "STATUS_PAUSED", { value: 'paused' });

JukeBox.prototype.loadQueue = function(queueID) {

    // Check if we have already loaded this queue
    if (this.queues[queueID] == null) {
        this.queues[queueID] = new Queue(queueID, this.queueStateChanged);
    }

    this.queueID = queueID;

};

JukeBox.prototype.getQueue = function() {

    return this.queues[this.queueID];

};

JukeBox.prototype.addToQueue = function(youTubeID) {

    this.getQueue().addSong(youTubeID);

};

JukeBox.prototype.queueStateChanged = function(queue) {
    if (queue.state === Queue.STATUS_LOADED) {
        this.playQueue();
    }
    if (queue.state === Queue.STATUS_PLAYING_FINISHED) {
        this.setStatus(JukeBox.STATUS_STOPPED);
    }
};

JukeBox.prototype.setStatus = function(status) {
    this.state = status;
};

JukeBox.prototype.control = function(action) {

    switch(action) {
        case 'play': this.setStatus(JukeBox.STATUS_PLAYING); break;
        case 'pause': this.setStatus(JukeBox.STATUS_PAUSED); break;
    }

    process.exec('./download.sh '+action, function (error, stdout, stderr) {
    });
};

JukeBox.prototype.playQueue = function() {

    if (this.state === JukeBox.STATUS_PLAYING) {
        return;
    }

    this.setStatus(JukeBox.STATUS_PLAYING);

    this.getQueue().play();
};




var Queue = function(ID, queueStateChangedCallback) {
    this.ID = ID;
    this.songs = [];
    this.queueStateChangedCallback = queueStateChangedCallback;
    this.state = Queue.STATUS_EMPTY;
    this.loadFromFile();
    this.play();
};

Object.defineProperty(Queue, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(Queue, "STATUS_PLAYING_FAILED", { value: 'playing_failed' });
Object.defineProperty(Queue, "STATUS_PLAYING_FINISHED", { value: 'playing_finished' });
Object.defineProperty(Queue, "STATUS_EMPTY", { value: 'empty' });
Object.defineProperty(Queue, "STATUS_LOADED", { value: 'loaded' });

Queue.prototype.shuffle = function() {
    this.songs.shuffle();
};

Queue.prototype.setState = function(status) {
    this.state = status;
    this.queueStateChangedCallback(this);
};

Queue.prototype.play = function() {

    for (var i=0; i<this.songs.length; i++) {

        // Get the song
        var song = this.songs[i];

        // Check the song is playable
        if(song.state !== Song.STATUS_PLAYABLE) {
            continue;
        }

        // Play the song!
        song.play();
        break;
    }
};

Queue.prototype.loadFromFile = function() {

    // Determine the queue file name
    var queueFile = './queues/'+this.ID+'.json';

    this.songs = JSON.parse(fs.readFileSync(queueFile).toString());

    if(this.songs.length === 0) {
        this.setState(Queue.STATUS_EMPTY);
        return;
    }

    this.setState(Queue.STATUS_LOADED);
};

Queue.prototype.addSong = function(youTubeID) {

    if(this.songs[youTubeID] !== null) {
        return;
    }

    this.songs.push(new Song(youTubeID, this.songStateChanged));
};

Queue.prototype.removeSong = function(youTubeID) {

    for (var i=0; i<this.songs.length; i++) {
        var song = this.songs[i];

        if(song.youTubeID === youTubeID) {
            this.songs[i].setStatus(Song.STATUS_REMOVING);
            delete this.songs[i];
            break;
        }
    }

};

Queue.prototype.songStateChanged = function(song) {

    if (song.state === Song.STATUS_PLAYABLE) {
        this.playQueue();
    }
    if (song.state === Song.STATUS_PLAYING_FINISHED) {
        this.removeSong(song.youTubeID);
    }
};




var Song = function(youTubeID, songStateChangedCallback) {
    this.youTubeID = youTubeID;
    this.data = {};
    this.download();
    this.songStateChangedCallback = songStateChangedCallback;
};

Object.defineProperty(Song, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(Song, "STATUS_PLAYING_FAILED", { value: 'playing_failed' });
Object.defineProperty(Song, "STATUS_PLAYING_FINISHED", { value: 'playing_finished' });
Object.defineProperty(Song, "STATUS_PAUSED", { value: 'paused' });
Object.defineProperty(Song, "STATUS_PLAYABLE", { value: 'playable' });
Object.defineProperty(Song, "STATUS_DOWNLOADING", { value: 'downloading' });
Object.defineProperty(Song, "STATUS_DOWNLOAD_FAILED", { value: 'download_failed' });
Object.defineProperty(Song, "STATUS_REMOVING", { value: 'removing' });

Song.prototype.setStatus = function(status) {

    this.state = status;

    this.songStateChangedCallback(this);
};

Song.prototype.download = function() {

    this.setStatus(Song.STATUS_DOWNLOADING);

    process.exec('./download.sh '+this.youTubeID, function (error, stdout, stderr) {

        if (error !== null) {

            this.setStatus(Song.STATUS_DOWNLOAD_FAILED);
            return;
        }

        // Read the info JSON file that should've been generated
        fs.readFile('./cache/'+this.youTubeID+'.info.json', function(err, f) {

            if (err !== null) {
                this.setStatus(Song.STATUS_DOWNLOAD_FAILED);
                return;
            }

            // Add the data we downloaded to the song object
            this.data = JSON.parse(f.toString());

            this.setStatus(Song.STATUS_PLAYABLE);

        }.bind(this));

    }.bind(this));
};

Song.prototype.play = function() {

    this.setStatus(Song.STATUS_PLAYING);

    process.exec('./play.sh '+this.youTubeID, function (error, stdout, stderr) {

        if(error !== null) {
            this.setStatus(Song.STATUS_PLAYING_FAILED);
        }

        this.setStatus(Song.STATUS_PLAYING_FINISHED);

    }.bind(this));
};


Array.prototype.shuffle = function() {
    var currentIndex = this.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }
};


// Initiate the player
var player = new JukeBox();
player.playQueue();


io.on('connection', function(socket){
    console.log('User connected');

    socket.emit('queue', player.getQueue());

    socket.on('addsong', function(song) {

        io.emit('resolving', song);
    });
});
