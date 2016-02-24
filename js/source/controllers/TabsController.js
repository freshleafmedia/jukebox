"use strict";

export default class TabsController {

    constructor(element)
    {
        this.container = element;
        this.contents = this.container.querySelectorAll(':scope > :not(ul)');
        this.links = this.container.querySelectorAll(':scope > ul:first-child > li > a');
        this.addEventListeners();
        this.container.querySelector(':scope > ul:first-child > li:first-child > a').click();
    }

    addEventListeners()
    {
        this.container.querySelector(':scope > ul:first-child').addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.hash) {
                this.deselectLinks();
                e.target.className = 'current';
                this.hideContents();
                this.showContents(e.target.hash)
            }
        });
    }

    hideContents()
    {
        for (var i = 0; i < this.contents.length; i++) {
            this.contents[i].style.display = 'none';
        }
    }

    showContents(hash) {
        this.container.querySelector(':scope > ' + hash).style.display = 'block';
    }

    deselectLinks()
    {
        for (var i = 0; i < this.links.length; i++) {
            this.links[i].className = '';
        }
    }
}
