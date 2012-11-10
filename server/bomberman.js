var io = require('socket.io');
var express = require('express');
var app = express(),
	server = require('http').createServer(app),
	io = io.listen(server);
server.listen(2000);

var settings = {
	fieldsX: 15,
	fieldsY: 10,
	bombDelay: 5,
	bombDuration: 2
};

function Bomb(id, x, y) {
	this.id = id;
	this.type = 'bomb';
	this.x = x;
	this.y = y;
}

function Game(settings) {
	var i, j;
	this.settings = settings;
	this.players = [];
	this.bombsCnt = 0;
	this.fields = [];
	for (i = 0; i < this.settings.fieldsY; i += 1) {
		this.fields[i] = [];
		for (j = 0; j < this.settings.fieldsX; j += 1) {
			this.fields[i].push(null);
		}
	}
}

Game.prototype = {
	newBomb: function (x, y) {
		var bomb = new Bomb(this.bombsCnt, x, y);
		this.bombsCnt += 1;
		return bomb;
	}
};

var games = [], playerCounter = 0;
var game = new Game(settings);
games.push(game);

io.sockets.on('connection', function (socket) {
	clientConnected(socket);
	socket.on('action', function (data) { playerAction(socket, data); });
	socket.on('disconnect', function () { clientDisconnected(socket); });
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
	socket.player.type = 'player';
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
			io.sockets.emit('playerAction', {player: socket.player});
			break;
		case 'u':
			if (socket.player.y > 0) {
				socket.player.y -= 1;
			}
			io.sockets.emit('playerAction', {player: socket.player});
			break;
		case 'r':
			if (socket.player.x < settings.fieldsX - 1) {
				socket.player.x += 1;
			}
			io.sockets.emit('playerAction', {player: socket.player});
			break;
		case 'd':
			if (socket.player.y < settings.fieldsY - 1) {
				socket.player.y += 1;
			}
			io.sockets.emit('playerAction', {player: socket.player});
			break;
		case 'b':
			io.sockets.emit('bomb', game.newBomb(socket.player.x, socket.player.y));
			break;
	}
}

function changeClientName(data) {
	player.name = data.name;
	console.log('name: ');
	console.log(data);
}
