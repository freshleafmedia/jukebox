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
        let song = new Song({ id: id }, function(){}, this.options);
        song.play();
    }

}

module.exports = SoundbiteController;