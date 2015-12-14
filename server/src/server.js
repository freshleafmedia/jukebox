'use strict';

var io = require('socket.io')(3000);
var process = require('child_process');

var JukeBox = require("./jukebox.js").JukeBox;

var pathCache = './cache';
var pathPlaylists = './playlists';


// Initiate the server
var server = new JukeBox();
server.playPlaylist();


io.on('connection', function(socket){
	console.log('User connected');

	socket.emit('playlist', player.getPlaylist());

	socket.on('addsong', function(song) {

		console.log(song.id+': Trying to add');

		player.addToPlaylist(song);

		//io.emit('resolving', song);
	});
});

