'use strict';
var Playlist = require("./playlist.js");
var process = require('child_process');

var io;

class JukeBox {

	constructor(options, pio) {
		io = pio;
		this.options = options || {};
		this.playlists = {};
		this.playlistID = 0;
		this.state = JukeBox.STATUS_STOPPED;

		// Set the default options
		if (typeof this.options.paths !== 'object') {
			this.options.paths = {};
		}
		if (typeof this.options.paths.playlists === 'undefined') {
			this.options.paths.playlists = './playlists';
		}
		if (typeof this.options.paths.cache === 'undefined') {
			this.options.paths.cache = './cache';
		}
		if (typeof this.options.paths.logs === 'undefined') {
			this.options.paths.cache = './logs';
		}

		this.loadPlaylist(0);
	};

	setStatus(status) {
		console.log('JUKEBOX STATE: ' + status);
		this.state = status;
	};

	loadPlaylist(playlistID) {

		// Check if we have already loaded this playlist
		if (typeof this.playlists[playlistID] === 'undefined') {
			this.playlists[playlistID] = new Playlist(playlistID, this.playlistStateChanged.bind(this), this.options, io);
		}

		this.playlistID = playlistID;
	};

	getPlaylist() {
		return this.playlists[this.playlistID];
	};

	addToPlaylist(song) {
		this.getPlaylist().addSong(song);
		io.emit('playlist', {ID: this.getPlaylist().ID ,songs: this.getPlaylist().songs});
	};

	playlistStateChanged(playlist) {

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

	control(action) {

		if (action === 'randomise') {
			this.getPlaylist().shuffle();

			io.emit('playlist', {ID: this.getPlaylist().ID,songs: this.getPlaylist().songs});
			return;
		}

		if (action === 'pause' && this.state === JukeBox.STATUS_PAUSED) {
			return false;
		}

		if (action === 'play' && this.state === JukeBox.STATUS_PLAYING) {
			return false;
		}

        if (action === 'next') {
            action = 'shutdown';
        }

		process.exec('echo "' + action + '" | netcat localhost 11337 ', function (error, stdout, stderr) {

			if(error !== null) {
				console.error('CONTROL[' + action + ']: Failed!');
				return;
			}
            // Set the correct state
            switch (action) {
                case 'play':
                    this.setStatus(JukeBox.STATUS_PLAYING);
                    this.getPlaylist().onResume();
                    break;
                case 'pause':
                    this.setStatus(JukeBox.STATUS_PAUSED);
                    this.getPlaylist().onPause();
                    break;
            }

		}.bind(this));
	};

	playPlaylist() {
		this.getPlaylist().play();
	};

	play() {
		this.control('play');
	};

	pause() {
		this.control('pause');
	};
}

Object.defineProperty(JukeBox, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(JukeBox, "STATUS_STOPPED", { value: 'stopped' });
Object.defineProperty(JukeBox, "STATUS_PAUSED", { value: 'paused' });


module.exports = JukeBox;