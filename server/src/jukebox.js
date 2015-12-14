'use strict';
var Playlist = require("./playlist.js");

class JukeBox {

	constructor(options) {
		this.options = options;
		this.playlists = {};
		this.playlistID = 0;
		this.state = JukeBox.STATUS_STOPPED;
		this.loadPlaylist(0);
	};

	setStatus(status) {
		console.log('JUKEBOX STATE: ' + status);
		this.state = status;
	};

	loadPlaylist(playlistID) {

		// Check if we have already loaded this playlist
		if (typeof this.playlists[playlistID] === 'undefined') {
			this.playlists[playlistID] = new Playlist(playlistID, this.playlistStateChanged.bind(this), this.options);
		}

		this.playlistID = playlistID;
	};

	getPlaylist() {
		return this.playlists[this.playlistID];
	};

	addToPlaylist(song) {
		this.getPlaylist().addSong(song);
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

		switch (action) {
			case 'play':	this.setStatus(JukeBox.STATUS_PLAYING); break;
			case 'pause':	this.setStatus(JukeBox.STATUS_PAUSED); break;
		}

		process.exec('./download.sh ' + action, function (error, stdout, stderr) {
		});
	};

	playPlaylist() {
		this.getPlaylist().play();
	};
}

Object.defineProperty(JukeBox, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(JukeBox, "STATUS_STOPPED", { value: 'stopped' });
Object.defineProperty(JukeBox, "STATUS_PAUSED", { value: 'paused' });


module.exports = JukeBox;