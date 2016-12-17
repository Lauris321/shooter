var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

var gameService = require('./server/gameService.js');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/googlebb845348c45f4975.html', (req, res) => {
	res.sendFile(__dirname + '/googlebb845348c45f4975.html');
});

app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 3000);

io.sockets.on('connection', (socket) => {
	socket.id = Math.random();
	gameService.addSocket(socket);

	const res = gameService.addPlayer(socket.id);
	console.log(res);

	if (res === "Player added!") {
		gameService.sendInitPack(socket.id);
		gameService.sendCreateObjectPack(gameService.getPlayer(socket.id).getInitPack());
		gameService.getPlayer(socket.id).connect(socket);
	}
});
