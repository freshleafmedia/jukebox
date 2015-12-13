var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var JukeBox = function() {
    this.playlists = {};
    this.playlistID = 0;
    this.state = JukeBox.STATUS_STOPPED;
    this.loadPlaylist(0);
};

Object.defineProperty(JukeBox, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(JukeBox, "STATUS_STOPPED", { value: 'stopped' });
Object.defineProperty(JukeBox, "STATUS_PAUSED", { value: 'paused' });

JukeBox.prototype.setStatus = function(status) {
    console.log('JUKEBOX STATE: '+ status);
    this.state = status;
};

JukeBox.prototype.loadPlaylist = function(playlistID) {

    // Check if we have already loaded this playlist
    if (typeof this.playlists[playlistID] === 'undefined') {
        this.playlists[playlistID] = new Playlist(playlistID, this.playlistStateChanged.bind(this));
    }

    this.playlistID = playlistID;

};

JukeBox.prototype.getPlaylist = function() {

    return this.playlists[this.playlistID];

};

JukeBox.prototype.addToPlaylist = function(youTubeID) {

    this.getPlaylist().addSong(youTubeID);

};

JukeBox.prototype.playlistStateChanged = function(playlist) {

    if (playlist.state === Playlist.STATUS_PLAYING) {
        this.setStatus(JukeBox.STATUS_PLAYING);
    }

    if (playlist.state === Playlist.STATUS_LOADED || playlist.state === Playlist.STATUS_READY) {
        this.playPlaylist();
    }

    if (playlist.state === Playlist.STATUS_EMPTY) {
        this.setStatus(JukeBox.STATUS_STOPPED);
    }
};

JukeBox.prototype.control = function(action) {

    switch(action) {
        case 'play': this.setStatus(JukeBox.STATUS_PLAYING); break;
        case 'pause': this.setStatus(JukeBox.STATUS_PAUSED); break;
    }

    process.exec('./download.sh '+action, function (error, stdout, stderr) {
    });
};

JukeBox.prototype.playPlaylist = function() {

    if (this.state === JukeBox.STATUS_PLAYING) {
        return;
    }

    this.getPlaylist().play();
};




var Playlist = function(ID, playlistStateChangedCallback) {
    this.ID = ID;
    this.songs = [];
    this.playlistStateChangedCallback = playlistStateChangedCallback;
    this.state = Playlist.STATUS_EMPTY;
    this.loadFromFile();
    this.play();
};

Object.defineProperty(Playlist, "STATUS_READY", { value: 'ready' });
Object.defineProperty(Playlist, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(Playlist, "STATUS_PLAYING_FAILED", { value: 'playing_failed' });
Object.defineProperty(Playlist, "STATUS_EMPTY", { value: 'empty' });
Object.defineProperty(Playlist, "STATUS_LOADED", { value: 'loaded' });

Playlist.prototype.shuffle = function() {
    this.songs.shuffle();
};

Playlist.prototype.setState = function(status) {
    console.log('PLAYLIST['+this.ID+'] STATE: '+ status);
    this.state = status;
    this.playlistStateChangedCallback(this);
};

Playlist.prototype.play = function() {

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

Playlist.prototype.loadFromFile = function() {

    // Determine the playlist file name
    var playlistFile = './playlists/'+this.ID+'.json';

    this.songs = JSON.parse(fs.readFileSync(playlistFile).toString());

    if(this.songs.length === 0) {
        this.setState(Playlist.STATUS_EMPTY);
        return;
    }

    this.setState(Playlist.STATUS_LOADED);
};

Playlist.prototype.removeSong = function(youTubeID) {

    for (var i=0; i<this.songs.length; i++) {
        var song = this.songs[i];

        if(song.youTubeID === youTubeID) {
            this.songs[i].setStatus(Song.STATUS_REMOVING);
            delete this.songs[i];
            break;
        }
    }

};

Playlist.prototype.songStateChanged = function(song) {

    if (song.state === Song.STATUS_PLAYING) {
        this.setState(Playlist.STATUS_PLAYING);
    }

    if (this.state !== Playlist.STATUS_PLAYING && song.state === Song.STATUS_PLAYABLE) {
        this.setState(Playlist.STATUS_READY);
    }

    if (song.state === Song.STATUS_PLAYING_FINISHED) {
        this.removeSong(song.youTubeID);

        // If this was the last song mark the playlist as empty
        if(this.songs.length === 0) {
            this.setState(Playlist.STATUS_EMPTY);
            return
        }

        this.setState(Playlist.STATUS_READY);

    }
};

Playlist.prototype.addSong = function(youTubeID) {

    if(typeof this.songs[youTubeID] !== 'undefined') {
        console.log(youTubeID+': Already on the playlist');
        return;
    }

    this.songs.push(new Song(youTubeID, this.songStateChanged.bind(this)));
};




var Song = function(youTubeID, songStateChangedCallback) {
    this.youTubeID = youTubeID;
    this.data = {};
    this.songStateChangedCallback = songStateChangedCallback;
    this.download();
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

    console.log('SONG['+this.youTubeID+'] STATE: '+ status);

    this.state = status;

    this.songStateChangedCallback(this);
};

Song.prototype.download = function() {

    this.setStatus(Song.STATUS_DOWNLOADING);

    process.exec('./download.sh '+this.youTubeID, function (error, stdout, stderr) {

        if (error !== null) {
            console.error(error);

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
player.playPlaylist();


io.on('connection', function(socket){
    console.log('User connected');

    socket.emit('playlist', player.getPlaylist());

    socket.on('addsong', function(song) {

        console.log(song.id+': Trying to add');

        player.addToPlaylist(song.id);

        //io.emit('resolving', song);
    });
});
