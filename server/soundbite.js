'use strict';

var Song = require('./song.js');
var process = require('child_process');

class Soundbite extends Song {

    play() {

        this.setStatus(Song.STATUS_PLAYING);

        process.exec('cvlc --play-and-exit -I rc --rc-host localhost:11338 "' + this.data['_filename'] + '"', function (error, stdout, stderr) {

                if (error !== null) {
                        this.setStatus(Song.STATUS_PLAYING_FAILED);
                }

                this.setStatus(Song.STATUS_PLAYING_FINISHED);

        }.bind(this));
    };

}

module.exports = Soundbite;
