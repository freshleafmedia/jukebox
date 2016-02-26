"use strict";

export default class MostPlayedController
{

    constructor(socket, googleApi)
    {
        this.socket = socket;
        this.googleApi = googleApi;
        this.metaDataCache = {};
        this.container = document.querySelector('#most-played');
    }

    updateList(songs)
    {
        this.googleApi.onInit(function() {
            this.addMetaData(songs, (songs) => {
                this.updateMarkup(songs);
            });
        }.bind(this));
    }

    addMetaData(songs, callback)
    {
        this.updateMetaDataCache(songs, function() {
            songs = songs.map(function (item) {
                let song = this.metaDataCache[item.id];
                song.plays = item.plays;
                return song;
            }.bind(this));
            callback(songs);
        }.bind(this));
    }

    updateMetaDataCache(songs, callback)
    {
        let songIdsToCache = songs.reduce((ids, item) => {
            if(!this.metaDataCache[item.id]) {
                ids.push(item.id);
                return ids;
            }
            return ids;
        }, []);
        this.googleApi.getInfo(songIdsToCache, function (dataArray) {
            console.log(dataArray);
            for (var i = 0; i < dataArray.length; i++) {
                var data  = dataArray[i];
                this.metaDataCache[data.id] = {
                    title: data.snippet.title
                };
            }
            callback();
        }.bind(this));
    }

    updateMarkup(songs)
    {
        this.container.innerHTML = '';
        for (var i = 0; i < songs.length; i++) {
            var elem = document.createElement('div');
            elem.textContent = '#' + (i+1) + ' - ' + songs[i].title + ' (' + songs[i].plays + ' plays)';
            this.container.appendChild(elem);
        }
    }
}
