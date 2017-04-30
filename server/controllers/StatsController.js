"use strict";
let fs = require('fs');

class StatsController
{

    constructor(options)
    {
        this.songs = {};
        this.options = options || {};
        this.load();
    }

    songPlay(song)
    {
        this.initSong(song);
        this.songs[song.id].plays += 1;
        this.onChange();
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
        if(!fs.existsSync('./stats.json')) {
            fs.writeFileSync('./stats.json', '{"songs":{}}')
        }

        let data = fs.readFileSync('./stats.json').toString();
        let loaded = JSON.parse(data);
        this.songs = loaded.songs;
        console.log('Loaded stats');
    }

    onChange()
    {
        if (this.options.onChange) {
            this.options.onChange();
        }
        this.save();
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

    getMostPlayed()
    {
        var songArray = [];
        for (var id in this.songs) {
            if (this.songs.hasOwnProperty(id)) {
                var song = this.songs[id];
                songArray.push({
                    id: id,
                    plays: song.plays
                });
            }
        }
        songArray = songArray.sort((a, b) => {
            return b.plays - a.plays;
        });
        return songArray.slice(0, 25);
    }
}

module.exports = StatsController;
