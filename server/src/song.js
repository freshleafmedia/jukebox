
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
