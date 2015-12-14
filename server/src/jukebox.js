var Playlist = require("./playlist.js").default;

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

