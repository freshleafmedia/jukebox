"use strict";

var process = require('child_process');
var Song = require("../song.js");

class SoundbiteController {

    constructor(io, options) {
        console.log('soundbite controller loaded');
        this.options = options;
    }

    play(id) {
        console.log('soundbite play command');
        new Song({ id: id }, function(song){
            if (song.state == Song.STATUS_PLAYABLE) {
                song.play();
            }
        }, this.options);
    }

}

module.exports = SoundbiteController;