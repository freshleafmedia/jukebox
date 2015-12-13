var socket = io('//:3000');
socket.on('connect', function(){
    console.log('connected to websocket server');
});

socket.on('disconnect', function(){
    console.log('disconnected');
    $('.media-controls .btn, #shutdown').addClass('disabled');
});

setTimeout(googleApiClientReady, 1000);
function googleApiClientReady() {
    gapi.client.setApiKey('AIzaSyC5ZNaxUE7HwOxi6r5xMq9aeRlUVdJXU7I');
    gapi.auth.init(function() {
        gapi.client.load('youtube', 'v3', function () {
            handleAPILoaded();
        });
    });
}

function notify(title, content) {
	if (window.Notification) {
		if (Notification.permission === "granted") {
			var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
		} else {
			Notification.requestPermission(function(permission) {
				var notification = new Notification(title, { 'body': content, 'icon': '/favicon.ico' });
			});
		}
	}
}

function handleAPILoaded() {
    $('#search').prop('disabled', false);
}

function search(query) {
    var request = gapi.client.youtube.search.list({
        q: query,
        part: 'snippet',
        maxResults: '25'
    });

    request.execute(function (response) {
        console.log(response.result);
        $('#search-container').html('');
        $.each(response.result.items, function(index, item) {
            if (item.id.kind == "youtube#video") {
                var el = $('<div />', { 'class': 'songResult' });
                el.data('url', item.id.videoId);
                var image = $('<img />', { src: item.snippet.thumbnails.default.url });
                var descWrap = $('<div />');
                var title = $('<p />', { text: item.snippet.title, 'class': 'title' });
                //var author = $('<p />', { text: item.snippet.channelTitle, 'class': 'description' });
                descWrap.append(title);
                //descWrap.append(author);
                var imgwrap = $('<div />', { 'class': 'imageWrapper' });
                imgwrap.append(image);
                el.append(imgwrap);
                el.append(descWrap);
                $('#search-container').append(el);
            }
        })
    });
}

$('#search-container').on('click', '> div', function() {
    var song = {
	id: $(this).data('url'),
	title: $(this).find('p.title').text(),
	thumbnail: $(this).find('img').attr('src')
    };
    addSong(song);
    $(this).addClass('added');
});

function addSong(song) {
    console.log('Adding.. ' + song.id);
    socket.emit('addsong', song);
}

$('#addButton').click(function() {
    showAddDialog();
});

$(document).keyup(function(event){
    // Up/Down and j/k keys to navigate selecting a song
    if (event.keyCode == 40 || event.keyCode == 74) {
        if($('.highlight').length) {
            var highlighted = $('.highlight');
            highlighted.next().addClass('highlight');
            highlighted.removeClass('highlight');
        } else {
            $('#search-container > .songResult:first-child').addClass('highlight');
        }
        return;
    }
    if (event.keyCode == 38 || event.keyCode == 75) {
        if($('.highlight').length) {
            var highlighted = $('.highlight');
            highlighted.prev().addClass('highlight');
            highlighted.removeClass('highlight');
        }
        return;
    }
    // Esc closes dialog
    if (event.keyCode == 27) {
        closeAddDialog();
    }
    // Run search on keydown in search box
    if ($(event.target).is('#search')) {
        if (event.keyCode == 13 && $('.highlight').length) {
            $('.highlight').click();
            return;
        }
        search($('#search').val());
    }
    // Keys when form input isn't focused
    if (!$(event.target).is('input')) {
        // A or Enter triggers dialog
        if (event.keyCode == 65 || event.keyCode == 13) {
            showAddDialog();
        }
    }
});

function showAddDialog() {
    $('#addDialog').show();
    $('#search').focus().val('');
}

$('#addDialogClose, .overlay').click(function() {
    closeAddDialog();
});

function closeAddDialog() {
    $('#addDialog').hide();
}


function updateNowPlaying(title) {
    if (title == '') {
        $('title').text('Freshleaf Jukebox');
    } else {
        $('title').text(title + ' - Freshleaf Jukebox');
    }
}

$(window).on('scroll', function() {
    var y_scroll_pos = window.pageYOffset;
    var scroll_pos_test = 120;             // set to whatever you want it to be

    if(y_scroll_pos > scroll_pos_test) {
        $('header').addClass('scrolled');
    }
    else {
        $('header').removeClass('scrolled');
    }
});


var JukeBox = function() {
    this.playlists = {};
};

JukeBox.prototype.setPlaylist = function(playlistData) {

    // Try and add this playlist
    this.addPlaylist(playlistData);

    this.playlistID = playlistData.ID;
};

JukeBox.prototype.addPlaylist = function(playlistData, overwrite) {

    // Check if we have already loaded this playlist
    if (overwrite === true || typeof this.playlists[playlistData.ID] === 'undefined') {
        this.playlists[playlistData.ID] = new PlayList(playlistData);
    }
};

JukeBox.prototype.getPlaylist = function() {
    return this.playlists[this.playlistID];
};



var PlayList = function(playlistData) {
    this.ID = playlistData.ID;
    this.songs = [];
    this.El = $('.queue-container');
    this.build(playlistData);
};

PlayList.prototype.build = function(playlistData) {

    $.each(playlistData.songs, function(index, song) {

        this.El.append(this.buildSong(song));

    }.bind(this));
};

PlayList.prototype.buildSong = function(song) {

    var item = $('<div />', { 'class': 'songResult', 'id': 'song-'+song.id, 'data-state': song.state, 'data-duration': song.data.duration });

    var image = $('<img />', { src: song.data.thumbnail });

    var title = $('<p />', { 'class': 'title', text: song.data.title });
    var imgwrap = $('<div />', { 'class': 'imageWrapper' });

    imgwrap.append(image);
    item.append(imgwrap);
    item.append(title);

    return item;
};


var player = new JukeBox();


socket.on('playlist', function(playlistData) {
    player.setPlaylist(playlistData);
});