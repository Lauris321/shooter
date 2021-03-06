var mongoService = require('./mongodbService.js');
var colDetService = require('./collisionDetectionService.js');

var sockets = {};
var players = {};

var map = {};
var tableData = {};

mongoService.mongoConnect(() => {
    mongoService.getItemById('Rooms', 'mapsCollection', (res) => {
		map = res;
	});
});


var deltaTimer = {
	then: Date.now(),
	delta: 0,
	updateDelta: () => {
		deltaTimer.delta = (Date.now() - deltaTimer.then) / 1000;
		deltaTimer.then = Date.now();
	},
};

function restartGame() {
	for(player in players) {
		players[player].x = players[player].spawn.x;
		players[player].y = players[player].spawn.y;
		players[player].alive = true
		for (var i in sockets) {
			sockets[i].emit('restartGame', {});
		}
		players[player].bullets = {};
		players[player].score = 0;
		players[player].respawnTimer = {
			diedAt: 0,
			respawnTime: 5000,
		};
		players[player].shootTimer = {
			lastShot: 0,
			shootingRate: 300,
		};

		players[player].pressingLeft = false;
		players[player].pressingRight = false;
		players[player].pressingUp = false;
		players[player].pressingDown = false;
		players[player].pressingAttack = false;

		tableData[players[player]._id] = {playerId: players[player]._id, score: 0};
	}
	for (var i in sockets) {
		sockets[i].emit('updateTable', tableData);
	}
};

function announceWinner(init) {
	restartGame();
};

function Bullet(init) {
	this._id = init._id;
	this.owner = init.owner;
	this.type = "bullet";
	this.x = init.x;
	this.y = init.y;
	this.speedX = Math.cos(init.angle / 180 * Math.PI) * 800;
	this.speedY = Math.sin(init.angle / 180 * Math.PI) * 800;
	this.angle = init.angle;

	this.updatePack = {
		_id: this._id,
		owner: this.owner,
		type: this.type,
		x: this.x,
		y: this.y,
	}

	this.checkWalls = function() {
		for(var wall in map.walls) {
			if (colDetService.RectDotColliding(this.x, this.y, map.walls[wall])) {
				return true;
			}
		}
		return false;
	}

	this.checkPlayers = function() {
		for(var player in players) {
			if (colDetService.CircleDotColliding(players[player].x, players[player].y, this.x, this.y, 19)) {
				return player;
			}
		}
		return false;
	}

	this.update = function(delta) {
		this.x += this.speedX * delta;
		this.y += this.speedY * delta;
	}
}

function Player(_id, spawn, name, user) {
	this._id = _id;
	this.type = "player";
	this.name = name;
	this.user = user;
	this.spawn = spawn;
	this.x = spawn.x;
	this.y = spawn.y;
	this.mouseX = 0;
	this.mouseY = 0;
	this.alive = true;
	this.pressingLeft = false;
	this.pressingRight = false;
	this.pressingUp = false;
	this.pressingDown = false;
	this.pressingAttack = false;
	this.angle = 0;
	this.maxSpd = 200;	// px/s
	this.color = spawn.color;
	this.bullets = {};
	this.score = 0;
	this.stats = {
		totalShotsFired: 0,
		totalHits: 0,
		totalDeaths: 0,
	};
	
	this.respawnTimer = {
		diedAt: 0,
		respawnTime: 5000,
	};
	this.shootTimer = {
		lastShot: 0,
		shootingRate: 300, // ms/bullet
	};

	this.getInitPack = function() {
		return {
			_id: this._id,
			type: this.type,
			name: this.name,
			x: this.x,
			y: this.y,
			angle: this.angle,
			color: this.color,
			bullets: this.bullets,
		}
	}

	this.getUpdatePack = function() {
		return {
			_id: this._id,
			type: this.type,
			name: this.name,
			x: this.x,
			y: this.y,
			angle: this.angle,
			color: this.color,
			bullets: this.bullets,
			alive: this.alive,
		}
	}

	this.connect = function(socket) {
		tableData[this._id] = {playerId: this._id, score: 0};
		for (var i in sockets) {
			sockets[i].emit('updateTable', tableData);
		}
		socket.on('keyPress', (data) => {
			if(data.inputId === 'left')
				players[socket.id].pressingLeft = data.state;
			else if (data.inputId === 'right')
				players[socket.id].pressingRight = data.state;
			else if (data.inputId === 'up')
				players[socket.id].pressingUp = data.state;
			else if (data.inputId === 'down')
				players[socket.id].pressingDown = data.state;
			else if (data.inputId === 'attack')
				players[socket.id].pressingAttack = data.state;
			else if (data.inputId === 'mouseAngle') {
				players[socket.id].mouseX = data.mouseX;
				players[socket.id].mouseY = data.mouseY;
			}
		});

		socket.on('sendMsgToServer', (data) => {
			var playerName = this.name;
			const message = {
				name: this.name,
				color: this.color,
				message: data,
			}
			for (var i in sockets) {
				sockets[i].emit('addToChat', message);
			}
		});

		socket.on('disconnect', () => {
			map.spawnpoints[players[this._id].spawn._id].free = true;
			delete tableData[this._id];

			for (var i in sockets) {
				sockets[i].emit('removeObject', this.getUpdatePack());
				sockets[i].emit('updateTable', tableData);
			}

			if (this.user != '') {
				mongoService.changeUserStats(this.user, this.stats, 'usersCollection', () => {

				});
			}

			delete sockets[socket.id];
			delete players[socket.id];
		});
	}

	this.update = function(delta) {
		if (this.alive) {
			var newX = this.x;
			var newY = this.y;
			
			if (this.pressingLeft) {
				this.mouseX += this.x;
				newX -= this.maxSpd * delta;

				if (this.checkWalls(newX, newY) || this.checkPlayers(newX, newY)) {
					newX += this.maxSpd * delta;
					this.mouseX -= this.x;
				} else {
					this.mouseX -= newX;
				}
			}
			if (this.pressingRight) {
				this.mouseX += this.x;
				newX += this.maxSpd * delta;

				if (this.checkWalls(newX, newY) || this.checkPlayers(newX, newY)) {
					newX -= this.maxSpd * delta;
					this.mouseX -= this.x;
				} else {
					this.mouseX -= newX;
				}
			}
			if (this.pressingUp) {
				this.mouseY += this.y;
				newY -= this.maxSpd * delta;

				if (this.checkWalls(newX, newY) || this.checkPlayers(newX, newY)) {
					newY += this.maxSpd * delta;
					this.mouseY -= this.y;
				} else {
					this.mouseY -= newY;
				}
			}
			if (this.pressingDown) {
				this.mouseY += this.y;
				newY += this.maxSpd * delta;

				if (this.checkWalls(newX, newY) || this.checkPlayers(newX, newY)) {
					newY -= this.maxSpd * delta;
					this.mouseY -= this.y;
				} else {
					this.mouseY -= newY;
				}
			}

			if(this.pressingAttack && (Date.now() - this.shootTimer.lastShot) > this.shootTimer.shootingRate ) {
				this.shootTimer.lastShot = Date.now();
				if(this.user != '') {
					this.stats.totalShotsFired++;
				}

				var newBullet = {
					_id: Math.random(),
					type: 'bullet',
					owner: this._id,
					angle: this.angle, 
					x: Math.cos(this.angle / 180 * Math.PI) * 20 + this.x, 
					y: Math.sin(this.angle / 180 * Math.PI) * 20 + this.y,
				};

				this.bullets[newBullet._id] = new Bullet(newBullet);
				sendCreateObjectPack(newBullet);
			}

			this.x = newX;
			this.y = newY;
			
			this.angle = Math.atan2(this.mouseY, this.mouseX) / Math.PI * 180;
		} else {
			if(this.respawnTimer.diedAt + this.respawnTimer.respawnTime <= Date.now()) {
				this.alive = true;
			}
		}

		for(var bullet in this.bullets) {
			const hit = this.bullets[bullet].checkPlayers();
			if (this.bullets[bullet].checkWalls()) {
				for (var i in sockets) {
					sockets[i].emit('removeObject', this.bullets[bullet].updatePack);
				}
				delete this.bullets[bullet];
			} else if (hit != false && hit != this._id && players[hit].alive) {
				players[hit].alive = false;
				this.score++;

				if(this.user != '') {
					this.stats.totalHits++;
					players[hit].stats.totalDeaths++;
				}

				tableData[this._id].score = this.score;

				var sortable = [];
				for (var player in tableData)
					sortable.push([player, tableData[player].score])

				sortable.sort(function(a, b) {
					return b[1] - a[1];
				});

				tableData = {};

				for (var player of sortable)
					tableData[player[0]] = {playerId: player[0], score: player[1]};

				players[hit].respawnTimer.diedAt = Date.now();

				for (var i in sockets) {
					sockets[i].emit('removeObject', this.bullets[bullet].updatePack);
					for (var i in sockets) {
						sockets[i].emit('updateTable', tableData);
					}
				}
				players[hit].alive = false;
				players[hit].x = players[hit].spawn.x;
				players[hit].y = players[hit].spawn.y;
				delete this.bullets[bullet];
				if(this.score >= 10) {
					announceWinner();
					break;
				}
			} else {
				this.bullets[bullet].update(delta);
			}
		}
	}

	this.checkWalls = function(x, y) {
		for(var wall in map.walls) {
			if (colDetService.RectCircleColliding(x, y, 19, map.walls[wall])) {
				return true;
			}
		}
		return false;
	}

	this.checkPlayers = function(x, y) {
		for(var player in players) {
			if(players[player]._id != this._id && players[player].alive) {
				if (colDetService.CircleCircleColliding(x, y, players[player].x, players[player].y, 17, 17)) {
					return true;
				}
			}
		}
		return false;
	}
}

var sendInitPack = (socketId) => {
	var pack = {};
	pack['map'] = map;
	pack['players'] = [];
	for(var i in players) {
		var curPlayer = players[i];
		curPlayer.update();
		pack['players'].push(curPlayer.getInitPack());
	}
	pack['yourId'] = socketId;
	sockets[socketId].emit('init', pack);
}

var sendCreateObjectPack = (object) => {
	for (var i in sockets) {
		var socket = sockets[i];
		socket.emit('createObject', object);
	}
}

var updateGame = () => {
	var pack = {};
	pack.players = [];
	deltaTimer.updateDelta();
    for (var i in players) {
		var curPlayer = players[i];
		curPlayer.update(deltaTimer.delta);
		pack.players.push(curPlayer.getUpdatePack());
	}

	pack.serverTime = Date.now();

	for (var i in sockets) {
		var socket = sockets[i];
		socket.emit('update', pack);
	}
}

var getPlayer = (playerId) => {
    return players[playerId];
}

var addPlayer = (playerId, name, user) => {
	var num = 0;
	for (var value of map.spawnpoints) {
		if( value.free == true) {
			players[playerId] = new Player(playerId, value, name, user);
			found = true;
			value.free = false;
			value._id = num;
			return "Player added!";
		}
		num++;
	}
	return "No spawns left!";
}

var addSocket = (socket) => {
    sockets[socket.id] = socket;
}

var changeMap = (mapId) => {
	mongoService.getItemById(mapId, 'mapsCollection', (res) => {
		map = res;
	});
}


setInterval(() => {
	updateGame();
}, 1000/60);

module.exports = {
    addPlayer,
    getPlayer,
    addSocket,
    sendInitPack,
    sendCreateObjectPack,
	changeMap,
};