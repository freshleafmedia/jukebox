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
        for (var id in sounds) {
            if (sounds.hasOwnProperty(id)) {
                var name = sounds[id];
                var element = document.createElement('div');
                element.className = 'soundbite';
                element.setAttribute('data-id', id);
                element.textContent = name;
                container.appendChild(element);
            }
        }
        document.querySelector('body').appendChild(container);
        document.addEventListener('keyup', (event) => {
            if (event.keyCode === 83) {
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
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