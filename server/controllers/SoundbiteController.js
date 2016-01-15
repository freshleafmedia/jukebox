"use strict";

var process = require('child_process');

class SoundbiteController {

    constructor(io) {
        console.log('soundbite controller loaded');
    }

    play(id) {
        console.log('soundbite play command');
        process.exec('cvlc --play-and-exit -I rc --rc-host localhost:11338 "http://www.youtube.com/watch?v=' + id + '"', (error, stdout, stderr) => {
            console.log('played soundbite');
            console.log(error);
            console.log(stdout);
            console.log(stderr);

        });
    }

}

module.exports = SoundbiteController;