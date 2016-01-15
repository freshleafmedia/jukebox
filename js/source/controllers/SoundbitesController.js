let config = require('../config/config.js').default;

"use strict";

export default class SoundbitesController
{

    constructor()
    {
        this.buildControls();
    }

    buildControls()
    {
        let sounds = config.soundbites.sounds;
        let container = document.createElement('div');
        container.className = 'soundbites';
        for (var id in sounds) {
            if (sounds.hasOwnProperty(id)) {
                var youtubeId = sounds[id];
                var element = document.createElement('div');
                element.className = 'soundbite';
                element.setAttribute('data-id', youtubeId);
                element.textContent = id;
                container.appendChild(element);
            }
        }
        document.querySelector('body').appendChild(container);
        document.addEventListener('keyup', () => {
            container.style.display = 'flex';
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
        console.log(id);
    }
}