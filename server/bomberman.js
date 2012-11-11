var io = require('socket.io');
var express = require('express');
var app = express(),
	server = require('http').createServer(app),
	io = io.listen(server);
server.listen(2000);

var settings = {
	fieldsX: 13,
	fieldsY: 11,
	bombDelay: 5,
	bombDuration: 2
};

function Wall() {
	this.type = 'wall';
	this.accessible = false;
	this.destructable = false;
}

function Bomb(game, id, x, y) {
	this.id = id;
	this.type = 'bomb';
	this.x = x;
	this.y = y;
	this.accessible = false;
	var me = this;
	setTimeout(function () { game.explosion(me); }, game.settings.bombDelay * 1000);
}

function Field() {
	this.objects = [];
}

Field.prototype = {
	add: function (object) {
		this.objects.push(object);
	},
	remove: function (object) {
		var i;
		for (i = 0; i < this.objects.length; i += 1) {
			if (this.objects[i].type === object.type && this.objects[i].id === object.id) {
				this.objects.splice(i, 1);
			}
		}
	},
	isAccessible: function () {
		var i, accessible = true;
		for (i = 0; i < this.objects.length; i += 1) {
			if (typeof this.objects[i].accessible !== 'undefined' && this.objects[i].accessible === false) {
				accessible = false;
				break;
			}
		}
		return accessible;
	},
	isDestructable: function () {
		var i, destructable = true;
		for (i = 0; i < this.objects.length; i += 1) {
			if (this.objects[i].destructable && this.objects[i].destructable === false) {
				destructable = false;
				break;
			}
		}
		return destructable;
	}
};

function Table(settings) {
	var i, j;
	this.fields = [];
	for (i = 0; i < settings.fieldsX; i += 1) {
		this.fields[i] = [];
		for (j = 0; j < settings.fieldsY; j += 1) {
			this.fields[i].push(new Field());
		}
	}
}

Table.prototype = {
	isAccessible: function (x, y) {
		return this.fields[x][y].isAccessible();
	},
	add: function (object, x, y) {
		this.fields[x][y].add(object);
	}
};

function Player(id, name) {
	this.id = id;
	this.name = name;
	this.type = 'player';
}

function Game(settings) {
	this.settings = settings;
	this.players = [];
	this.bombsCnt = 0;
	this.table = new Table(this.settings);
	this.map = [
        {x: 1, y: 1, t: 'w'},
        {x: 3, y: 1, t: 'w'},
        {x: 5, y: 1, t: 'w'},
        {x: 7, y: 1, t: 'w'},
        {x: 9, y: 1, t: 'w'},
        {x: 11, y: 1, t: 'w'},
        {x: 1, y: 3, t: 'w'},
        {x: 3, y: 3, t: 'w'},
        {x: 5, y: 3, t: 'w'},
        {x: 7, y: 3, t: 'w'},
        {x: 9, y: 3, t: 'w'},
        {x: 11, y: 3, t: 'w'},
        {x: 1, y: 5, t: 'w'},
        {x: 3, y: 5, t: 'w'},
        {x: 5, y: 5, t: 'w'},
        {x: 7, y: 5, t: 'w'},
        {x: 9, y: 5, t: 'w'},
        {x: 11, y: 5, t: 'w'},
        {x: 1, y: 7, t: 'w'},
        {x: 3, y: 7, t: 'w'},
        {x: 5, y: 7, t: 'w'},
        {x: 7, y: 7, t: 'w'},
        {x: 9, y: 7, t: 'w'},
        {x: 11, y: 7, t: 'w'},
        {x: 1, y: 9, t: 'w'},
        {x: 3, y: 9, t: 'w'},
        {x: 5, y: 9, t: 'w'},
        {x: 7, y: 9, t: 'w'},
        {x: 9, y: 9, t: 'w'},
        {x: 11, y: 9, t: 'w'}
    ];
	this.loadMap(this.map);
}

Game.prototype = {
	newBomb: function (x, y) {
		var bomb = new Bomb(this, this.bombsCnt, x, y);
		this.table.add(bomb, x, y);
		this.bombsCnt += 1;
		return bomb;
	},
	explosion: function (bomb) {
		console.log('Bomb ' + bomb.id + ' exploded.');
	},
	playerAction: function (socket, data) {
		switch (data.action) {
			case 'l':
				this.moveLeft(socket.player);
				break;
			case 'u':
				this.moveUp(socket.player);
				break;
			case 'r':
				this.moveRight(socket.player);
				break;
			case 'd':
				this.moveDown(socket.player);
				break;
			case 'b':
				io.sockets.emit('bomb', game.newBomb(socket.player.x, socket.player.y));
				break;
		}
	},
	moveLeft: function (player) {
		if (player.x > 0 && this.table.isAccessible(player.x - 1, player.y)) {
			player.x -= 1;
			this.notifyPlayerAction(player);
		}
	},
	moveUp: function (player) {
		if (player.y > 0 && this.table.isAccessible(player.x, player.y - 1)) {
			player.y -= 1;
			this.notifyPlayerAction(player);
		}
	},
	moveRight: function (player) {
		if (player.x < this.settings.fieldsX - 1 && this.table.isAccessible(player.x + 1, player.y)) {
			player.x += 1;
			this.notifyPlayerAction(player);
		}
	},
	moveDown: function (player) {
		if (player.y < settings.fieldsY - 1 && this.table.isAccessible(player.x, player.y + 1)) {
			player.y += 1;
			this.notifyPlayerAction(player);
		}
	},
	notifyPlayerAction: function (player) {
		io.sockets.emit('playerAction', {player: player});
	},
	loadMap: function (map) {
		var i;
		for (i = 0; i < map.length; i += 1) {
			if (map[i].t === 'w') {
				this.table.add(new Wall(), map[i].x, map[i].y);
			}
		}
	}
};

var games = [], playerCounter = 0;
var game = new Game(settings);
games.push(game);

io.sockets.on('connection', function (socket) {
	clientConnected(socket);
	socket.on('action', function (data) { game.playerAction(socket, data); });
	socket.on('disconnect', function () { clientDisconnected(socket); });
});

function clientConnected(socket) {
	socket.player = new Player(playerCounter, 'Player #' + Math.floor(Math.random() * 9999) + 1);
	socket.player.color = game.players.length - 1;
	socket.player.x = Math.floor(Math.random() * settings.fieldsX);
	socket.player.y = Math.floor(Math.random() * settings.fieldsY);
	playerCounter += 1;
	game.players.push(socket.player);
	socket.emit('news', {message: 'Welcome to Dyna Bomber!'});
	socket.emit('start', {players: game.players, map: game.map});
}

function clientDisconnected(socket) {
	console.log(socket.player.name + ' disconnected.');
}
