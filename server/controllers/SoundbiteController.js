"use strict";

var process = require('child_process');
var Soundbite = require("../soundbite.js");

class SoundbiteController {

    constructor(io, options) {
        console.log('soundbite controller loaded');
        this.options = options;
    }

    play(id) {
        console.log('soundbite play command');
        new Soundbite({ id: id }, function(soundbite){
            if (soundbite.state == Soundbite.STATUS_PLAYABLE) {
                soundbite.play();
            }
        }, this.options);
    }

}

module.exports = SoundbiteController;
