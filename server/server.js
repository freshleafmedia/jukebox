'use strict';

var io = require('socket.io')(3000);

var JukeBox = require("./jukebox.js");

// Define the server options
var options = {
	paths: {
		cache: 'cache',
		playlists: 'playlists',
		logs: 'logs'
	}
};

// Initiate the server
var server = new JukeBox(options, io);
server.playPlaylist();

io.on('connection', function(socket){
	console.log('User connected');

    var playlist = server.getPlaylist();
    var playlistObj = {
        ID: playlist.ID,
        songs: playlist.songs
    };
	socket.emit('playlist', playlistObj);

	socket.on('addsong', function(song) {

		server.addToPlaylist(song);

		//io.emit('resolving', song);
	});

	socket.on('control', function(action) {
		console.log('CONTROL[' + action + ']: Received request');
		server.control(action);
	});
});

