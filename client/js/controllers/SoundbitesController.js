let config = require('../config/config.js').default;

"use strict";

export default class SoundbitesController
{

    constructor(socket)
    {
        this.socket = socket;
        this.buildControls();
    }

    buildControls()
    {
        let sounds = config.soundbites.sounds;
        let container = document.createElement('div');
        container.className = 'soundbites';
        for (var i in sounds) {
            if (sounds.hasOwnProperty(i)) {
                var displayNumber = parseInt(i) + 1;
                displayNumber = (displayNumber > 9) ? 0 : displayNumber;
                var sound = sounds[i];
                var element = document.createElement('div');
                element.className = 'soundbite';
                element.setAttribute('data-id', sound.id);
                element.textContent = displayNumber + ' ' + sound.name;
                container.appendChild(element);
            }
        }
        document.querySelector('body').appendChild(container);
        document.addEventListener('keyup', (event) => {
            if (event.keyCode === 83 && event.target.id !== "search") {
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
            }
            if (event.keyCode >= 48 && event.keyCode <= 57 && event.target.id !== "search") {
                let number = event.keyCode - 48 - 1;
                number = (number < 0) ? 9 : number;
                if (sounds[number]) {
                    this.play(sounds[number].id)
                }
            }
        });
        container.addEventListener('click', (event) => {
            if (event.target.className === 'soundbite') {
                let youtubeId = event.target.dataset.id;
                this.play(youtubeId);
            }
        });
    }

    play(id)
    {
        this.socket.emit('soundbite', id);
    }
}