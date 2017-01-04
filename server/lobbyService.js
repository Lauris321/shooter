var gameService = require('./gameService.js');
var users = require('./userService.js');

var connections = {};

var lobbyInfo = {
    connectonsNum: 0,
}

function Connection(_id, socket) {
	this._id = _id;
    this.socket = socket;

	this.connect = function(socket) {
        socket.on('enterLobby', (data) => {
            gameService.addSocket(socket);

            const res = gameService.addPlayer(socket.id, data.name);

            if (res === "Player added!") {
            	gameService.sendInitPack(socket.id);
            	gameService.sendCreateObjectPack(gameService.getPlayer(socket.id).getInitPack());
            	gameService.getPlayer(socket.id).connect(socket);
            }
        });

        socket.on('login', (data) => {
            users.login(data, (res) => {
                socket.emit('loginData', res);
            });
        });

        socket.on('authenticate', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                socket.emit('authenticateRes', res);
            });
        });

        socket.on('mapCreator', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                socket.emit('mapCreatorInit', res);
            });
        });

        socket.on('register', (data) => {
            users.register(data, (res) => {
                users.login(data, (loginRes) => {
                    socket.emit('loginData', loginRes);
                });
            });
        });

		socket.on('disconnect', () => {
            lobbyInfo.connectonsNum--;
            for (var conn in connections) {
                connections[conn].socket.emit('lobbyInfo', lobbyInfo);
            }
			delete connections[socket.id];
		});
	}
}

var addSocket = (socket) => {
    connections[socket.id] = new Connection(socket.id, socket);
    connections[socket.id].connect(socket);
    lobbyInfo.connectonsNum++;
    for (var conn in connections) {
        connections[conn].socket.emit('lobbyInfo', lobbyInfo);
    }
}

var addPlayer = (socket) => {
    const res = gameService.addPlayer(socket.id);

	if (res === "Player added!") {
		gameService.sendInitPack(socket.id);
		gameService.sendCreateObjectPack(gameService.getPlayer(socket.id).getInitPack());
		gameService.getPlayer(socket.id).connect(socket);
	}
}

module.exports = {
    addSocket,
};