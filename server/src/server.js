'use strict';

var io = require('socket.io')(3000);

var JukeBox = require("./jukebox.js");

var pathCache = './cache';
var pathPlaylists = './playlists';


// Initiate the server
var server = new JukeBox();
server.playPlaylist();


io.on('connection', function(socket){
	console.log('User connected');

	socket.emit('playlist', server.getPlaylist());

	socket.on('addsong', function(song) {

		console.log(song.id+': Trying to add');

		server.addToPlaylist(song);

		//io.emit('resolving', song);
	});
});

