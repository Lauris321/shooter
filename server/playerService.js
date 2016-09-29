var players = {};

function Player(_id) {
	this._id = _id;
	this.x = 250;
	this.y = 400;
	this.mouseX = 0;
	this.mouseY = 0;
	this.pressingLeft = false;
	this.pressingRight = false;
	this.pressingUp = false;
	this.pressingDown = false;
	this.angle = 0;
	this.maxSpd = 200;	// px/s
	this.color = '#00ff00';

	this.getInitPack = function() {
		return {
			_id: this._id,
			x: this.x,
			y: this.y,
			angle: this.angle,
			color: this.color,
		}
	}

	this.getUpdatePack = function() {
		return {
			_id: this._id,
			x: this.x,
			y: this.y,
			angle: this.angle,
			color: this.color,
		}
	}

	this.connect = function(socket) {
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

		// socket.on('disconnect', () => {
		// 	for (var i in sockets) {
		// 		sockets[i].emit('removeObject', socket.id);
		// 	}
		// 	delete sockets[socket.id];
		// 	delete players[socket.id];
		// });
	}

	this.update = function(delta, map) {
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

		this.x = newX;
		this.y = newY;
		
		this.angle = Math.atan2(this.mouseY, this.mouseX) / Math.PI * 180;
	}

	this.checkWalls = function(x, y, map) {
		for(var wall in map.walls) {
			var rect = {
				x: map.walls[wall].x1,
				y: map.walls[wall].y1,
				w: map.walls[wall].x2 - map.walls[wall].x1,
				h: map.walls[wall].y2 - map.walls[wall].y1,
			}

			if (colDetService.RectCircleColliding(x, y, 19, rect)) {
				return true;
			}
		}
		return false;
	}

	this.checkPlayers = function(x, y) {
		for(var player in players) {
			if(players[player]._id != this._id) {
				if (colDetService.CircleCircleColliding(x, y, players[player].x, players[player].y, 17, 17)) {
					return true;
				}
			}
		}
		return false;
	}
}

var addPlayer = (playerId) => {
    players[playerId] = new Player(playerId);
}

var getAllPlayers = () => {
    return players;
}

module.exports = {
    addPlayer,
    getAllPlayers,
};