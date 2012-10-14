var io = require('socket.io');
var express = require('express');
var app = express(),
	server = require('http').createServer(app),
	io = io.listen(server);
server.listen(2000);

var clients = [], games = [], settings = {fieldsX: 15, fieldsY: 10}, playerCounter = 0;
var game = createGame();
games.push(game);

io.sockets.on('connection', function (socket) {
	var player = {};
	clients.push(socket);
	socket.player = player;
	game.players.push(player);
	player.id = 'p' + playerCounter;
	playerCounter += 1;
	player.name = 'Player #' + Math.floor(Math.random() * 9999) + 1;
	player.color = clients.length - 1;
	player.x = Math.floor(Math.random() * settings.fieldsX);
	player.y = Math.floor(Math.random() * settings.fieldsY);
	socket.emit('news', {message: 'Welcome to Dyna Bomber!'});
	socket.emit('start', {players: game.players});
	socket.on('name', function (data) {
		player.name = data.name;
		console.log('name: ');
		console.log(data);
	});
	socket.on('action', function (data) {
		switch (data.action) {
			case 'l':
				if (player.x > 0) {
					player.x -= 1;
				}
				break;
			case 'u':
				if (player.y > 0) {
					player.y -= 1;
				}
				break;
			case 'r':
				if (player.x < settings.fieldsX - 1) {
					player.x += 1;
				}
				break;
			case 'd':
				if (player.y < settings.fieldsY - 1) {
					player.y += 1;
				}
				break;
		}
		io.sockets.emit('broadcast', {player: player});
		console.log(data);
	});
});

function createGame() {
	var i, j, game = {
		fieldsX: settings.fieldsX,
		fieldsY: settings.fieldsY,
		players: []
	};
	game.fields = [];
	for (i = 0; i < game.fieldsY; i += 1) {
		game.fields[i] = [];
		for (j = 0; j < game.fieldsX; j += 1) {
			game.fields[i].push(null);
		}
	}
	return game;
}


//var io = require('socket.io').listen(2000);
//
//io.sockets.on('connection', function (socket) {
//	io.sockets.emit('this', { will: 'be received by everyone', socket: socket });
//	
//	socket.emit('news', { hello: 'world' });
//	socket.on('action', function (data) {
//		console.log(data);
//	});
//});
