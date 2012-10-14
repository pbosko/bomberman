var bp = {};
bp.bomberman = {};
history = {};

var socket = io.connect('http://localhost:2000');
//socket.emit('name', { name: 'Player #' + Math.floor(Math.random() * 9999) + 1 });
socket.on('news', function (data) {
	$('#serverMessages').html($('#serverMessages').html() + '<p>server: ' + data.message + '</p>');
});

socket.on('broadcast', function (data) {
	console.log(data);
	var player = data.player;
	//$('#serverMessages').html('<p>' + data.player.name + ': ' + data.action + '</p>' + $('#serverMessages').html());
	if (history[player.id]) {
		$('#field_' + history[player.id].x + '_' + history[player.id].y).removeClass();
	}
	$('#field_' + player.x + '_' + player.y).removeClass().addClass('color' + player.color);
	history[player.id] = {x: player.x, y: player.y};
});

socket.on('start', function (data) {
	var i, player, players = data.players;
	for (i = 0; i < players.length; i += 1) {
		player = players[i];
		$('#field_' + player.x + '_' + player.y).removeClass().addClass('color' + player.color);
	}
});


function display(key) {
	socket.emit('action', { action: key });
}
$('body').keydown(function (e) {
	var code = e.keyCode || e.which;
	// display(code);
	switch (code) {
		case 32:
			display('b');
			break;
		case 37:
			display('l');
			break;
		case 38:
			display('u');
			break;
		case 39:
			display('r');
			break;
		case 40:
			display('d');
			break;
	}
});