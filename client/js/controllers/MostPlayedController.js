"use strict";
let $ = require('jquery');
let songHelper = require('../helpers/songs.js');

export default class MostPlayedController
{

    constructor(socket, googleApi)
    {
        this.socket = socket;
        this.googleApi = googleApi;
        this.metaDataCache = {};
        this.container = document.querySelector('#most-played');
        this.initClickEvents();
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
            for (var i = 0; i < dataArray.length; i++) {
                var data  = dataArray[i];
                this.metaDataCache[data.id] = data;
            }
            callback();
        }.bind(this));
    }

    updateMarkup(songs)
    {
        this.container.innerHTML = '';
        for (var i = 0; i < songs.length; i++) {
            let elem = songHelper.buildSongMarkup(songs[i]);
            this.container.appendChild(elem);
        }
    }

    initClickEvents()
    {
        $(this.container).on('click', '> div', (event) => {
            var song = {
                id: $(event.currentTarget).data('url'),
                title: $(event.currentTarget).find('p.title').text(),
                thumbnail: $(event.currentTarget).find('img').attr('src'),
                username: localStorage.getItem('username')
            };
            this.addSongToPlaylist(song);
            $(event.currentTarget).addClass('added');
        });

    }

    addSongToPlaylist(song)
    {
        console.log('Adding.. ' + song.id);
        this.socket.emit('addsong', song);
    }
}
