var bp = {};
bp.bomberman = {};
bp.bomberman.game = (function () {
	
	function Table(fieldsX, fieldsY) {
		this.fields = [];
		var i, j;
		for (i = 0; i < fieldsX; i += 1) {
			this.fields[i] = [];
			for (j = 0; j < fieldsY; j += 1) {
				this.fields[i][j] = [];
			}
		}
	}
	
	Table.prototype = {
		add: function (object, x, y) {
			this.fields[x][y].push(object);
		},
		remove: function (object, x, y) {
			var i, pos = -1;
			for (i = 0; i < this.fields[x][y].length; i+= 1) {
				if (this.fields[x][y][i].id === object.id) {
					pos = i;
					break;
				}
			}
			if (pos > -1) {
				this.fields[x][y].splice(pos, 1);
			}
		},
		top: function (x, y) {
			var res = null;
			if (this.fields[x][y].length > 0) {
				res = this.fields[x][y][this.fields[x][y].length - 1];
			}
			return res;
		}
	};
	
	function Bomberman() {
		var me = this;
		this.history = {};
		this.fieldsX = 15; // TODO: get this values on connect
		this.fieldsY = 10;
		this.socket = io.connect('http://bomberman.dev:2000');
		this.socket.on('news', function (data) { me.serverMessage(data); });
		this.socket.on('playerAction', function (data) { me.playerAction(data); });
		this.socket.on('start', function (data) { me.gameStart(data); });
		this.table = new Table(this.fieldsX, this.fieldsY);
	}
	
	Bomberman.prototype = {
		doAction: function (key) {
			this.socket.emit('action', { action: key });
		},
		serverMessage: function (data) {
			$('#serverMessages').html($('#serverMessages').html() + '<p>server: ' + data.message + '</p>');
		},
		playerAction: function (data) {
			var top, player = data.player;
			if (this.history[player.id]) {
				this.table.remove(player, this.history[player.id].x, this.history[player.id].y);
				$('#field_' + this.history[player.id].x + '_' + this.history[player.id].y).removeClass();
				top = this.table.top(this.history[player.id].x, this.history[player.id].y);
				if (top) {
					$('#field_' + top.x + '_' + top.y).addClass('color' + top.color);
				}
			}
			this.placePlayer(player);
		},
		gameStart: function (data) {
			var i, players = data.players;
			for (i = 0; i < players.length; i += 1) {
				this.placePlayer(players[i]);
			}
		},
		placePlayer: function (player) {
			$('#field_' + player.x + '_' + player.y).removeClass().addClass('color' + player.color);
			this.history[player.id] = {x: player.x, y: player.y};
			this.table.add(player, player.x, player.y);
		}
	};
	
	return new Bomberman();
}());
