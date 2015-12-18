var Playlist = require("./playlist.js").default;

export default class Jukebox
{
    constructor(socket)
    {
        this.socket = socket;
        this.playlists = {};
        this.setEventHandlers();
    }

    setEventHandlers() {
        $('.media-controls').on('click', '.btn', (e) => {
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
        this.addPlaylist(playlistData);

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
}


