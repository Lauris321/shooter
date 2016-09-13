var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv, {});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 3000);


var SOCKET_LIST = {};

var Map = (width, height) => {
    var self = {
        width: width,
        height: height,
    }
	return self;
}

var Entity = () => {
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	return self;
}

var Player = (id) => {
    var self = Entity();

	self.id = id;
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
    self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 7;

    var super_update = self.update;
	self.update = () => {
		self.updateSpd();
		super_update();

        if(self.pressingAttack ){
			self.shootBullet(self.mouseAngle);
		}
	}

    self.shootBullet = (angle) => {
		var b = Bullet(angle);
		b.x = self.x;
		b.y = self.y;
	}

	self.updateSpd = () => {
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;		
	}
    Player.list[id] = self;
	return self;
}
Player.list = {};

Player.onConnect = (socket) => {
	var player = Player(socket.id);
	socket.on('keyPress', (data) => {
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if (data.inputId === 'right')
			player.pressingRight = data.state;
		else if (data.inputId === 'up')
			player.pressingUp = data.state;
		else if (data.inputId === 'down')
			player.pressingDown = data.state;
        else if (data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if (data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
}

Player.onDisconnect = (socket) => {
	delete Player.list[socket.id];
}

Player.update = () => {
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});		
	}
	return pack;
}

var Bullet = function(angle){
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
	self.spdY = Math.sin(angle/180*Math.PI) * 10;
	
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100) 
			self.toRemove = true;
        else if (self.x <= 0 || self.x >= map.width)
            self.toRemove = true;
        else if (self.y <= 0 || self.y >= map.height)
            self.toRemove = true;
		super_update();
	}
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();

        if(bullet.toRemove)
			delete Bullet.list[i];

		pack.push({
			x: bullet.x,
			y: bullet.y,
            spdX: bullet.spdX,
            spdY: bullet.spdY,
		});		
	}
	return pack;
}

var map = Map(500, 500);
io.sockets.on('connection', (socket) => {
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	socket.emit('mapInfo', map);
	
    Player.onConnect(socket);

	socket.on('disconnect', () => {
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});

setInterval(() => {
    var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}

	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions', pack);
	}
}, 1000/40);