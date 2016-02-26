var GoogleApi = require("../helpers/google.js").default;
var SearchController = require("./SearchController.js").default;
var Playlist = require("./PlaylistController.js").default;
var SoundbitesController = require("./SoundbitesController.js").default;
var TabsController = require("./TabsController.js").default;
var MostPlayedController = require("./MostPlayedController.js").default;
var notify = require("../helpers/notifications.js").notify;
var $ = require('jquery');

export default class ApplicationController
{
    constructor(socket)
    {
        this.socket = socket;
        this.playlists = {};
        this.setEventHandlers();
        new TabsController(document.querySelector('.tabs'));
        this.googleApi = new GoogleApi();
        new SearchController(socket, this.googleApi);
        this.mostPlayedController = new MostPlayedController(socket, this.googleApi);
        this.setupSockets();
        new SoundbitesController(socket);
    }

    setupSockets()
    {
        this.socket.on('connect', () => {
            console.log('connected to websocket server');
            $('#volupButton, #voldownButton, #shuffleSongs, #forwardButton').removeClass('disabled');
        });

        this.socket.on('disconnect', () => {
            console.log('disconnected');
            $('.media-controls .btn, #shutdown, #shuffleSongs').addClass('disabled');
        });
        this.socket.on('playlist', (playlistData) => {
            this.setPlaylist(playlistData);
        });
        this.socket.on('mostPlayed', (data) => {
            this.mostPlayedController.updateList(data);
        });

        this.socket.on('songRemove', (song) => {
            this.getPlaylist().removeSong(song);
        });

        this.socket.on('songAdd', (song) => {
            notify('Song Added', song.data.title);
        });

        this.socket.on('songStatus', (song) => {
            if(song.state === 'playing') {
                notify('Now Playing', song.data.title);
                this.updateNowPlaying(song.data.title);
            }
            this.getPlaylist().updateSongStatus(song);
        });

        this.socket.on('jukeboxState', (state) => {
            if(state === 'playing') {
                $('.media-controls button#playButton').addClass('disabled');
                $('.media-controls button#pauseButton').removeClass('disabled');
            }
            if(state === 'paused') {
                $('.media-controls button#playButton').removeClass('disabled');
                $('.media-controls button#pauseButton').addClass('disabled');
            }
        });

        this.socket.on('songPosition', (position) => {
            this.getPlaylist().updateSongPosition(position);
        });
    }

    setEventHandlers() {
        $(document).on('click', 'button[data-action]', (e) => {
            if ($(e.currentTarget).hasClass('disabled')) {
                console.warn('Button disabled');
                return;
            }

            // Get the action to send
            var action = $(e.currentTarget).attr('data-action');

            this.control(action);
        });

    }

    control(action) {
        console.log('Sending action: '+action);
        this.socket.emit('control', action);
    }

    setPlaylist(playlistData)
    {
        // Try and add this playlist
        this.addPlaylist(playlistData, true);

        this.playlistID = playlistData.ID;
    }

    addPlaylist(playlistData, overwrite)
    {
        // Check if we have already loaded this playlist
        if (overwrite === true || typeof this.playlists[playlistData.ID] === 'undefined') {
            this.playlists[playlistData.ID] = new Playlist(playlistData);
        }
    }

    getPlaylist()
    {
        return this.playlists[this.playlistID];
    }

    updateNowPlaying(title)
    {
        if (title == '') {
            $('title').text('Freshleaf Jukebox');
        } else {
            $('title').text(title + ' - Freshleaf Jukebox');
        }
    }
}
