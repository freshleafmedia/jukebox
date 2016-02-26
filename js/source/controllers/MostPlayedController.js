"use strict";

export default class MostPlayedController
{

    constructor(socket)
    {
        this.socket = socket;
        this.container = document.querySelector('#most-played');
    }

    updateList(data)
    {
        this.container.innerHTML = '';
        for (var i = 0; i < data.length; i++) {
            var elem = document.createElement('div');
            elem.textContent = '#' + (i+1) + ' - ' + data[i].id + ' (' + data[i].plays + ' plays)';
            this.container.appendChild(elem);
        }
    }
}
