"use strict";
let fs = require('fs');

class StatsController
{

    constructor()
    {
        this.songs = {};
        this.load();
    }

    songPlay(song)
    {
        this.initSong(song);
        this.songs[song.id].plays += 1;
        this.save();
    }

    initSong(song)
    {
        if (!this.songs[song.id]) {
            this.songs[song.id] = {
                plays: 0
            };
        }
    }

    load()
    {
        let data = fs.readFileSync('./stats.json').toString();
        let loaded = JSON.parse(data);
        this.songs = loaded.songs;
        console.log('Loaded stats');
    }

    save()
    {
        let toSave = { songs: this.songs };
        fs.writeFile('./stats.json', JSON.stringify(toSave), (err) => {
            if (err) {
                console.log("Couldn't save stats: " + err.message);
                return;
            }
            console.log('Saved stats');
        });
    }
}

module.exports = StatsController;
