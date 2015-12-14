var Song = require("./song.js").default;

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

