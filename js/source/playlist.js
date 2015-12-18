export default class Playlist {

    constructor(playlistData) {
        this.ID = playlistData.ID;
        this.songs = [];
        this.El = $('.queue-container');
        this.build(playlistData);
    }

    build(playlistData)
    {
        $.each(playlistData.songs, function(index, song) {

            this.addSong(song);

        }.bind(this));
    }

    buildSong(song)
    {
        var item = $('<div />', { 'class': 'songResult', 'id': 'song-'+song.youTubeID, 'data-state': song.state, 'data-duration': song.data.duration });

        var image = $('<img />', { src: song.thumbnail });
        var title = $('<p />', { 'class': 'title', text: song.data.title });
        var progress = $('<progress />', { value: 0, max: song.data.duration });

        var imgwrap = $('<div />', { 'class': 'imageWrapper' });
        var contentwrap = $('<div />', { 'class': 'contentWrapper' });

        imgwrap.append(image);
        contentwrap.append(title);
        contentwrap.append(progress);
        item.append(imgwrap);
        item.append(contentwrap);

        return item;
    }

    removeSong(songToRemove)
    {
        this.El.children('#song-'+songToRemove.youTubeID).remove();

        for (var i=0; i<this.songs.length; i++) {
            var song = this.songs[i];

            if(song.youTubeID === songToRemove.youTubeID) {
                this.songs.splice(i,1);
                break;
            }
        }
    }

    addSong(song)
    {
        this.El.append(this.buildSong(song));
    }
}



