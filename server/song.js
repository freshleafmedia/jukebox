'use strict';
var fs  = require("fs");
var process = require('child_process');

var io;

class Song {

	constructor(songRaw, songStateChangedCallback, options, pio) {
		io = pio;
		this.options = options || {};
		this.youTubeID = songRaw.id;
		this.thumbnail = 'https://i.ytimg.com/vi/' + this.youTubeID + '/mqdefault.jpg';
        this.position = 0;
		this.data = {
			title: songRaw.title
		};
		this.songStateChangedCallback = songStateChangedCallback;
		this.download();
	};

	setStatus(status) {

		console.log('SONG[' + this.youTubeID + '] STATE: ' + status);

		if (status === Song.STATUS_REMOVING) {
			io.emit('songRemove', this);
		}

		this.state = status;

		this.songStateChangedCallback(this);
	};

	download() {

		this.setStatus(Song.STATUS_DOWNLOADING);

		process.execFile('./download.sh', [ this.youTubeID, this.options.paths.cache, this.options.paths.logs ], function (error, stdout, stderr) {

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

	play() {

		this.setStatus(Song.STATUS_PLAYING);

		process.exec('cvlc --play-and-exit -I rc --rc-host localhost:11337 "' + this.data['_filename'] + '"', function (error, stdout, stderr) {

			if (error !== null) {
				this.setStatus(Song.STATUS_PLAYING_FAILED);
			}

			this.setStatus(Song.STATUS_PLAYING_FINISHED);

		}.bind(this));
	};
}

Object.defineProperty(Song, "STATUS_PLAYING", { value: 'playing' });
Object.defineProperty(Song, "STATUS_PLAYING_FAILED", { value: 'playing_failed' });
Object.defineProperty(Song, "STATUS_PLAYING_FINISHED", { value: 'playing_finished' });
Object.defineProperty(Song, "STATUS_PAUSED", { value: 'paused' });
Object.defineProperty(Song, "STATUS_PLAYABLE", { value: 'playable' });
Object.defineProperty(Song, "STATUS_DOWNLOADING", { value: 'downloading' });
Object.defineProperty(Song, "STATUS_DOWNLOAD_FAILED", { value: 'download_failed' });
Object.defineProperty(Song, "STATUS_REMOVING", { value: 'removing' });

module.exports = Song;
