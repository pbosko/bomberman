var io = require('socket.io');
var express = require('express');
var app = express(),
	server = require('http').createServer(app),
	io = io.listen(server);
server.listen(2000);

var clients = [];

io.sockets.on('connection', function (socket) {
	clients.push(socket);
	socket.name = socket.id;
	socket.emit('news', { message: 'Welcome to Dyna Bomber!' });
	socket.on('name', function (data) {
		socket.name = data.name;
		console.log('name: ');
		console.log(data);
	});
	socket.on('action', function (data) {
		io.sockets.emit('broadcast', { name: socket.name, action: data.action });
		console.log(data);
	});
});




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
