var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});
var users = require('./server/userService.js');

var lobbyService = require('./server/lobbyService.js');


app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});

app.get('/register', users.register);

app.get('/googlebb845348c45f4975.html', (req, res) => {
	res.sendFile(__dirname + '/googlebb845348c45f4975.html');
});

app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 3000);

io.sockets.on('connection', (socket) => {
	socket.id = Math.random();
	lobbyService.addSocket(socket);
	
});
