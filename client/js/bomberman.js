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
				if (this.fields[x][y][i].id === object.id && this.fields[x][y][i].type === object.type) {
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
		this.fieldsX = 13; // TODO: get this values on connect
		this.fieldsY = 11;
		this.socket = io.connect('http://bomberman.dev:2000');
		this.socket.on('news', function (data) { me.serverMessage(data); });
		this.socket.on('start', function (data) { me.gameStart(data); });
		this.socket.on('playerAction', function (data) { me.playerAction(data); });
		this.socket.on('bomb', function (data) { me.newBomb(data); });
		this.socket.on('explosion', function (data) { me.explosion(data); });
		this.socket.on('extinguish', function (data) { me.extinguish(data); });
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
			var top, player = data.player, cssClass;
			if (this.history[player.id]) {
				this.table.remove(player, this.history[player.id].x, this.history[player.id].y);
				$('#field_' + this.history[player.id].x + '_' + this.history[player.id].y).removeClass();
				top = this.table.top(this.history[player.id].x, this.history[player.id].y);
				if (top) {
					if (top.type == 'player') {
						cssClass = 'color' + top.color;
					} else {
						cssClass = 'bomb';
					}
					$('#field_' + top.x + '_' + top.y).addClass(cssClass);
				}
			}
			this.placePlayer(player);
		},
		newBomb: function (bomb) {
			$('#field_' + bomb.x + '_' + bomb.y).removeClass().addClass('bomb');
			this.table.add(bomb, bomb.x, bomb.y);
		},
		explosion: function (data) {
			$('#field_' + data.x + '_' + data.y).removeClass().addClass('cross');
		},
		extinguish: function (data) {
			this.table.remove(data, data.x, data.y);
			$('#field_' + data.x + '_' + data.y).removeClass();
		},
		gameStart: function (data) {
			var i, players = data.players, map = data.map;
			for (i = 0; i < players.length; i += 1) {
				this.placePlayer(players[i]);
			}
			for (i = 0; i < map.length; i += 1) {
				if (map[i].t === 'w') {
					$('#field_' + map[i].x + '_' + map[i].y).addClass('wall');
				}
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
