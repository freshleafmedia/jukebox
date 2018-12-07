'use strict';

var Song = require('./song.js');
var process = require('child_process');

class Soundbite extends Song {

    play() {

        this.setStatus(Song.STATUS_PLAYING);

        const volume = 75;
        const gain = Math.pow((volume - 0.5) / 100, 3);

        process.exec(`cvlc --play-and-exit -A alsa --alsa-audio-device sysdefault:CARD=PCH --alsa-gain=${gain} --no-volume-save "${this.data['_filename']}"`, function (error, stdout, stderr) {

                if (error !== null) {
                        this.setStatus(Song.STATUS_PLAYING_FAILED);
                }

                this.setStatus(Song.STATUS_PLAYING_FINISHED);

        }.bind(this));
    };

}

module.exports = Soundbite;
