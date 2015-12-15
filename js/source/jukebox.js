var Playlist = require("./playlist.js").default;

export default class Jukebox
{
    constructor()
    {
        this.playlists = {};
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
