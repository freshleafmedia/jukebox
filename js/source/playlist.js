export default class Playlist {

    constructor(playlistData) {
        this.ID = playlistData.ID;
        this.songs = [];
        this.El = $('.queue-container');
        this.build(playlistData);
    }

    build(playlistData)
    {
        //Clear the current playlist
        this.El.html('');

        $.each(playlistData.songs, function(index, song) {

            this.addSong(song);

        }.bind(this));
    }

    buildSong(song)
    {
        var item = $('<div />', { 'class': 'songResult', 'id': 'song-'+song.id, 'data-state': song.state });

        var image = $('<img />', { src: song.thumbnail });
        var duration = $('<p />', { 'class': 'duration', text: (song.data.duration / 60).toFixed(2) });
        var title = $('<p />', { 'class': 'title', text: song.data.title });
        var progress = $('<progress />', { value: song.position, max: song.data.duration });
        var username = $('<p />', { 'class': 'username', text: song.username });

        var imgwrap = $('<div />', { 'class': 'imageWrapper' });
        var contentwrap = $('<div />', { 'class': 'contentWrapper' });

        imgwrap.append(image);
        contentwrap.append(title);
        contentwrap.append(progress);
        item.append(imgwrap);
        item.append(contentwrap);
        item.append(username);
        item.append(duration);

        return item;
    }

    removeSong(songToRemove)
    {
        this.El.children('#song-'+songToRemove.id).remove();

        for (var i=0; i<this.songs.length; i++) {
            var song = this.songs[i];

            if(song.id === songToRemove.id) {
                this.songs.splice(i,1);
                break;
            }
        }
    }

    addSong(song)
    {
        this.El.append(this.buildSong(song));
    }

    updateSongStatus(song)
    {
        var songEl = this.El.find('.songResult#song-' + song.id);
        songEl.attr('data-state', song.state);
        songEl.find('.duration').text((song.data.duration / 60).toFixed(2));
        songEl.find('progress').attr('value', song.position);
        songEl.find('progress').attr('max', song.data.duration);
    }

    updateSongPosition(position)
    {
        var songEl = this.El.find('.songResult[data-state=playing]');
        songEl.find('progress').attr('value', position);
    }
}



