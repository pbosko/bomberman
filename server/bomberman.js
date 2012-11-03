var io = require('socket.io');
var express = require('express');
var app = express(),
	server = require('http').createServer(app),
	io = io.listen(server);
server.listen(2000);

var games = [], settings = {fieldsX: 15, fieldsY: 10}, playerCounter = 0;
var game = createGame();
games.push(game);

io.sockets.on('connection', function (socket) {
	clientConnected(socket);
	
	socket.on('action', function (data) { playerAction(socket, data) });
	
	socket.on('disconnect', function () { clientConnected(socket) });
});

function clientConnected(socket) {
	socket.player = {};
	game.players.push(socket.player);
	socket.player.id = 'p' + playerCounter;
	playerCounter += 1;
	socket.player.name = 'Player #' + Math.floor(Math.random() * 9999) + 1;
	socket.player.color = game.players.length - 1;
	socket.player.x = Math.floor(Math.random() * settings.fieldsX);
	socket.player.y = Math.floor(Math.random() * settings.fieldsY);
	socket.emit('news', {message: 'Welcome to Dyna Bomber!'});
	socket.emit('start', {players: game.players});
}

function clientDisconnected(socket) {
	console.log(socket.player.name + ' disconnected.');
}

function playerAction(socket, data) {
	switch (data.action) {
		case 'l':
			if (socket.player.x > 0) {
				socket.player.x -= 1;
			}
			break;
		case 'u':
			if (socket.player.y > 0) {
				socket.player.y -= 1;
			}
			break;
		case 'r':
			if (socket.player.x < settings.fieldsX - 1) {
				socket.player.x += 1;
			}
			break;
		case 'd':
			if (socket.player.y < settings.fieldsY - 1) {
				socket.player.y += 1;
			}
			break;
		case 'b':
			console.log(socket.player.name + ' planted a bomb at (' + socket.player.x + ', ' + socket.player.y + ')');
			break;
	}
	io.sockets.emit('playerAction', {player: socket.player});
}

function changeClientName(data) {
	player.name = data.name;
	console.log('name: ');
	console.log(data);
}

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
