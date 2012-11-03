bp.bomberman.ui = (function() {
	"use strict";
	
	function BombermanUI() {
		this.game = null;
	}
	
	BombermanUI.prototype = {
		init: function (bomberman) {
			this.game = bomberman;
			this.createTable();
		},
		createTable: function () {
			var container, i, j;
			container = $('<div id="table"></div>');
			for (i = 0; i < this.game.fieldsY; i += 1) {
				for (j = 0; j < this.game.fieldsX; j += 1) {
					container.append($('<div id="field_' + j + '_' + i + '"></div>'));
				}
			}
			$('#bomberman').append(container);
			$('body').keydown(function (e) {
				var code = e.keyCode || e.which;
				switch (code) {
				case 32:
					bp.bomberman.game.doAction('b');
					break;
				case 37:
					bp.bomberman.game.doAction('l');
					break;
				case 38:
					bp.bomberman.game.doAction('u');
					break;
				case 39:
					bp.bomberman.game.doAction('r');
					break;
				case 40:
					bp.bomberman.game.doAction('d');
					break;
				}
			});
		}
	};
	
	return new BombermanUI();
}());

bp.bomberman.ui.init(bp.bomberman.game);