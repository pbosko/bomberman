bp.bomberman.ui = (function() {
	"use strict";
	
	function BombermanUI() {
		this.fieldsX = 15;
		this.fieldsY = 10;
	}
	
	BombermanUI.prototype = {
		init: function () {
			this.createTable();
		},
		createTable: function () {
			var container, i, j;
			container = $('<div id="table"></div>');
			for (i = 0; i < this.fieldsY; i += 1) {
				for (j = 0; j < this.fieldsX; j += 1) {
					container.append($('<div id="field_' + j + '_' + i + '"></div>'));
				}
			}
			$('#bomberman').append(container);
		}
	};
	
	return new BombermanUI();
}());

bp.bomberman.ui.init();