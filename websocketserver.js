var io = require('socket.io')(3000);
var fs  = require("fs");
var process = require('child_process');

var pathCache = './cache';
var pathPlaylists = './playlists';

export default class JukeBox {

	const STATUS_PLAYING = 'playing';
	const STATUS_STOPPED = 'stopped';
	const STATUS_PAUSED = 'paused';

	constructor() {
		this.playlists = {};
		this.playlistID = 0;
		this.state = JukeBox.STATUS_STOPPED;
		this.loadPlaylist(0);
	}

	setStatus = function (status) {
		console.log('JUKEBOX STATE: ' + status);
		this.state = status;
	};

	loadPlaylist = function (playlistID) {

		// Check if we have already loaded this playlist
		if (typeof this.playlists[playlistID] === 'undefined') {
			this.playlists[playlistID] = new Playlist(playlistID, this.playlistStateChanged.bind(this));
		}

		this.playlistID = playlistID;
	};

	getPlaylist = function () {
		return this.playlists[this.playlistID];
	};

	addToPlaylist = function (song) {
		this.getPlaylist().addSong(song);
	};

	playlistStateChanged = function (playlist) {

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

	control = function (action) {

		switch (action) {
			case 'play':	this.setStatus(JukeBox.STATUS_PLAYING); break;
			case 'pause':	this.setStatus(JukeBox.STATUS_PAUSED); break;
		}

		process.exec('./download.sh ' + action, function (error, stdout, stderr) {
		});
	};

	playPlaylist = function () {
		this.getPlaylist().play();
	};
}


export default class Playlist {

    const STATUS_READY = 'ready';
    const STATUS_PLAYING = 'playing';
    const STATUS_PLAYING_FAILED = 'playing_failed';
    const STATUS_EMPTY = 'empty';
    const STATUS_LOADED = 'loaded';

    constructor(ID, playlistStateChangedCallback) {
        this.ID = ID;
        this.songs = [];
        this.playlistStateChangedCallback = playlistStateChangedCallback;
        this.state = Playlist.STATUS_EMPTY;
        this.loadFromFile();
        this.play();
    };

    shuffle = function () {
        this.songs.shuffle();
    };

    setState = function (status) {
        console.log('PLAYLIST[' + this.ID + '] STATE: ' + status);
        this.state = status;
        this.playlistStateChangedCallback(this);
    };

    play = function () {

        if (this.state === Playlist.STATUS_PLAYING) {
            return;
        }

        for (var i = 0; i < this.songs.length; i++) {

            // Get the song
            var song = this.songs[i];

            // Check the song is playable
            if (song.state !== Song.STATUS_PLAYABLE) {
                continue;
            }

            // Play the song!
            song.play();
            break;
        }
    };

    loadFromFile = function () {

        // Determine the playlist file name
        var playlistFile = './playlists/' + this.ID + '.json';

        this.songs = JSON.parse(fs.readFileSync(playlistFile).toString());

        if (this.songs.length === 0) {
            this.setState(Playlist.STATUS_EMPTY);
            return;
        }

        this.setState(Playlist.STATUS_LOADED);
    };

    removeSong = function (youTubeID) {

        for (var i = 0; i < this.songs.length; i++) {
            var song = this.songs[i];

            if (song.youTubeID === youTubeID) {
                this.songs[i].setStatus(Song.STATUS_REMOVING);

                this.songs.splice(i, 1);
                break;
            }
        }

    };

    songStateChanged = function (song) {

        if (song.state === Song.STATUS_PLAYING) {
            this.setState(Playlist.STATUS_PLAYING);
        }

        if (this.state !== Playlist.STATUS_PLAYING && song.state === Song.STATUS_PLAYABLE) {
            this.setState(Playlist.STATUS_READY);
        }

        if (song.state === Song.STATUS_PLAYING_FINISHED) {
            this.removeSong(song.youTubeID);

            // If this was the last song mark the playlist as empty
            if (this.songs.length === 0) {
                this.setState(Playlist.STATUS_EMPTY);
                return
            }

            this.setState(Playlist.STATUS_READY);

        }
    };

    addSong = function (songRaw) {

        var youTubeID = songRaw.id;

        // Check if the song is already on the playlist
        var onList = false;
        for (var i = 0; i < this.songs.length; i++) {
            var song = this.songs[i];

            if (song.youTubeID === youTubeID) {
                onList = true;
                break;
            }
        }

        if (onList === true) {
            console.log('SONG[' + youTubeID + ']: Already on the playlist');
            return;
        }

        var song = new Song(songRaw, this.songStateChanged.bind(this));
        this.songs.push(song);

        io.emit('songAdd', song);
    };
}



export default class Song {

    const STATUS_PLAYING = 'playing';
    const STATUS_PLAYING_FAILED = 'playing_failed';
    const STATUS_PLAYING_FINISHED = 'playing_finished';
    const STATUS_PAUSED = 'paused';
    const STATUS_PLAYABLE = 'playable';
    const STATUS_DOWNLOADING = 'downloading';
    const STATUS_DOWNLOAD_FAILED = 'download_failed';
    const STATUS_REMOVING = 'removing';

    constructor(songRaw, songStateChangedCallback) {
        this.youTubeID = songRaw.id;
        this.thumbnail = 'https://i.ytimg.com/vi/' + this.youTubeID + '/mqdefault.jpg';
        this.data = {
            title: songRaw.title
        };
        this.songStateChangedCallback = songStateChangedCallback;
        this.download();
    }

    setStatus = function (status) {

        console.log('SONG[' + this.youTubeID + '] STATE: ' + status);

        if (status === Song.STATUS_REMOVING) {
            io.emit('songRemove', this);
        }

        this.state = status;

        this.songStateChangedCallback(this);
    };

    download = function () {

        this.setStatus(Song.STATUS_DOWNLOADING);

        process.exec('./download.sh ' + this.youTubeID, function (error, stdout, stderr) {

            if (error !== null) {
                console.error(error);

                this.setStatus(Song.STATUS_DOWNLOAD_FAILED);
                return;
            }

            // Read the info JSON file that should've been generated
            fs.readFile('./cache/' + this.youTubeID + '.info.json', function (err, f) {

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

    play = function () {

        this.setStatus(Song.STATUS_PLAYING);

        process.exec('cvlc --play-and-exit -I rc --rc-host localhost:11337 "' + this.data['_filename'] + '"', function (error, stdout, stderr) {

            if (error !== null) {
                this.setStatus(Song.STATUS_PLAYING_FAILED);
            }

            this.setStatus(Song.STATUS_PLAYING_FINISHED);

        }.bind(this));
    };
}


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

        player.addToPlaylist(song);

        //io.emit('resolving', song);
    });
});
