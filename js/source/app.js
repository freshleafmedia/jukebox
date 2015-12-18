var Jukebox = require("./jukebox.js").default;
var Search = require("./search.js").default;

var socket = io('//:3000');
socket.on('connect', function(){
    console.log('connected to websocket server');
});

socket.on('disconnect', function(){
    console.log('disconnected');
    $('.media-controls .btn, #shutdown').addClass('disabled');
});

var player = new Jukebox(socket);
var search = new Search(socket);

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

socket.on('playlist', function(playlistData) {
    player.setPlaylist(playlistData);
});

socket.on('songRemove', function(song) {
    player.getPlaylist().removeSong(song);
});

socket.on('songAdd', function(song) {
    player.getPlaylist().addSong(song);
});

navigator.serviceWorker.register('/worker.js', {
    scope: '/'
}).then(function(reg) {
    console.log('service worker registered', reg);
}, function(err) {
    console.log('service worker NOT registered', err);
});