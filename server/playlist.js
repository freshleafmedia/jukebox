'use strict';
var Song = require("./song.js");
var fs  = require("fs");
var io;

class Playlist {

	constructor(ID, playlistStateChangedCallback, options, pio) {
		io = pio;
		this.options = options || {};
		this.ID = ID;
		this.songs = [];
		this.playlistStateChangedCallback = playlistStateChangedCallback;
		this.state = Playlist.STATUS_EMPTY;
        this.positionTimer = null;
        this.position = 0;

		this.loadFromFile();
		this.play();
	};

	getPath() {
		// Determine the directory the playlist files are
		var playlistDir = this.options.paths.playlists;

		// Ensure the root directory exists
		try {
			fs.mkdirSync(playlistDir);
		} catch(e) {}

		return playlistDir+'/'+this.ID+'.json';
	};

	shuffle() {
        this.interleave(true);
	};

    interleave(shuffle) {
        var userSongs = this.songs.reduce((userSongs, song) => {
            if (!userSongs[song.username]) {
                userSongs[song.username] = [];
            }
            userSongs[song.username].push(song);
            return userSongs;
        }, {});
        if (shuffle) {
            Object.keys(userSongs).forEach((user) => {
                userSongs[user].shuffle();
            });
        }
        var listLength = Object.keys(userSongs).reduce((listLength, user) => {
            return Math.max(listLength, userSongs[user].length);
        }, 0);
        var newSongs = [];
        for (var i = 0; i < listLength; i++) {
            Object.keys(userSongs).forEach((user) => {
				if (userSongs[user][i]) {
					newSongs.push(userSongs[user][i]);
				}
            });
        }
        this.songs = newSongs;
    }

	setState(status) {
		console.log('PLAYLIST[' + this.ID + '] STATE: ' + status);
		this.persist();
		this.state = status;
		this.playlistStateChangedCallback(this);
	}

	// Persist the playlist to disk
	persist() {

		// Check the file exists
		fs.stat(this.getPath(), function (err, stats) {

			if (err !== null) {
				console.error('PlAYLIST[' + this.ID + ']: No existing playlist');
			}

			// Hack: Remove the playlist file else invalid JSON gets written to it
			else if (stats.isFile()) {
				fs.unlinkSync(this.getPath());
			}

			// Write the songs array to the file
			fs.writeFile(this.getPath(), JSON.stringify(this.songs), { flags: '+w' }, function (err) {
				if (err !== null) {
					console.error('PlAYLIST[' + this.ID + ']: Failed to write');
					throw err;
				}
			}.bind(this));
		}.bind(this));
	};

	play() {

		if (this.state === Playlist.STATUS_PLAYING) {
			return;
		}

		for (var i = 0; i < this.songs.length; i++) {

			// Get the song
			var song = this.songs[i];

			// Check the song is playable
			if (song.state !== Song.STATUS_PLAYABLE && song.state !== Song.STATUS_PLAYING) {
				continue;
			}

			// Play the song!
			song.play();
            this.position = 0;
            this.onResume();
			break;
		}
	};

    onPause() {
        clearInterval(this.positionTimer);
    }

    onResume() {
        clearInterval(this.positionTimer);
        this.positionTimer = setInterval(() => {
            this.position++;
            io.emit('songPosition', this.position);
        }, 1000);
    }

	loadFromFile() {

		// Check the file exists
		fs.stat(this.getPath(), function (err, stats) {

			// Empty the current song list
			this.songs = [];

			// if were were able to read the playlist file ok then try and load it
			if (err === null && stats.isFile()) {

				// This will either read the file if it exists or if not create one
				var JSONData = fs.readFileSync(this.getPath(),{ flags: '+w' }).toString();

				var songsData = (JSONData !== '') ? JSON.parse(JSONData):[];

				for (var i = 0; i < songsData.length; i++) {

					// Get the song data
					var songData = songsData[i];

					this.addSong(songData);
				}


			}
			else {
				console.error('PLAYLIST['+this.ID+']: Failed to load from file');
			}

			console.log('PLAYLIST['+this.ID+']: '+this.songs.length+' song(s) loaded');

			if (this.songs.length === 0) {
				this.setState(Playlist.STATUS_EMPTY);
				return;
			}

			this.setState(Playlist.STATUS_LOADED);

		}.bind(this));
	};

	removeSong(id) {

		for (var i = 0; i < this.songs.length; i++) {
			var song = this.songs[i];

			if (song.id === id) {
				this.songs[i].setStatus(Song.STATUS_REMOVING);

				this.songs.splice(i, 1);
				break;
			}
		}

	};

	songStateChanged(song) {

		if (song.state === Song.STATUS_PLAYING) {
			this.setState(Playlist.STATUS_PLAYING);
		}

		if (this.state !== Playlist.STATUS_PLAYING && song.state === Song.STATUS_PLAYABLE) {
			this.setState(Playlist.STATUS_READY);
		}
        io.emit('songStatus', song);

		if (song.state === Song.STATUS_PLAYING_FINISHED) {
			this.removeSong(song.id);
            io.emit('songRemove', song);

			// If this was the last song mark the playlist as empty
			if (this.songs.length === 0) {
				this.setState(Playlist.STATUS_EMPTY);
				return
			}

			this.setState(Playlist.STATUS_READY);

		}
	};

	addSong(songRaw) {

		console.log('SONG[' + songRaw.id + ']: Adding...');

		if (this.isOnPlaylist(songRaw) === true) {
			console.log('SONG[' + songRaw.id + ']: Already on the playlist');
			return;
		}

		var song = new Song(songRaw, this.songStateChanged.bind(this), this.options, io);
		this.songs.push(song);
		this.interleave();
	}

	isOnPlaylist(song) {

		// Check if the song is already on the playlist
		for (var i = 0; i < this.songs.length; i++) {

			if (this.songs[i].id === song.id) {
				return true;
			}
		}
		return false;
	};
}

Object.defineProperty(Playlist, "STATUS_READY", { value: 'ready' });
Object.defineProperty(Playlist, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(Playlist, "STATUS_PLAYING_FAILED", { value: 'playing_failed' });
Object.defineProperty(Playlist, "STATUS_EMPTY", { value: 'empty' });
Object.defineProperty(Playlist, "STATUS_LOADED", { value: 'loaded' });


module.exports = Playlist;
