var gameService = require('./gameService.js');
var users = require('./userService.js');
const mongoDb = require('./mongodbService.js');

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
            
            users.authenticateUser(data.user, data.accessToken, (result) => {
                var res;
                if(result === 'admin' || result === 'user') {
                    res = gameService.addPlayer(socket.id, data.name, data.user);
                } else {
                    res = gameService.addPlayer(socket.id, data.name, '');
                }

                if (res === "Player added!") {
                    gameService.sendInitPack(socket.id);
                    gameService.sendCreateObjectPack(gameService.getPlayer(socket.id).getInitPack());
                    gameService.getPlayer(socket.id).connect(socket);
                }
            });
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

        socket.on('getMap', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if (res === 'admin') {
                    mongoDb.getItemById(data.mapName, 'mapsCollection', (map) => {
                        socket.emit('getMapRes', map);
                    });
                }
            });
        });

        socket.on('addMap', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    console.log(data);
                    mongoDb.saveItem(data.map, 'mapsCollection');
                }
            });
        });

        socket.on('changeMap', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    gameService.changeMap(data.mapName);
                }
            });
        });

        socket.on('deleteMap', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    mongoDb.deleteOneItem(data.mapName, 'mapsCollection');
                }
            });
        });

        socket.on('getAllMaps', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    mongoDb.getAllItems('mapsCollection', (all) => {
                        var result = {};
                        result['maps'] = all
                        result['function'] = data.function;
                        socket.emit('allMapsRes', result);
                    });
                }
            });
        });

        socket.on('getAllUsers', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    mongoDb.getAllItems('usersCollection', (all) => {
                        socket.emit('allUsersRes', all);
                    });
                }
            });
        });

        socket.on('changeAuth', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin') {
                    mongoDb.changeAuth(data.user, data.auth, 'usersCollection', (all) => {});
                }
            });
        });

        socket.on('getStats', (data) => {
            users.authenticateUser(data.name, data.accessToken, (res) => {
                if(res === 'admin' || res === 'user') {
                    mongoDb.getItemById(data.name, 'usersCollection', (result) => {
                        socket.emit('getStatsRes', result);
                    });
                }
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