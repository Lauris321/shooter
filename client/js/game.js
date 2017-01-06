var players = [];
var mouseX = 0;
var mouseY = 0;
var map = {};
var ping = 0;
var serverTime = 0;
var localTime = 0;

var chatText;
var chatInput;
var chatForm;

var ctx;
var _id = '';
var angle = 0;

function Bullet(init) {
    this._id = init._id;
    this.x = init.x;
    this.y = init.y;
    this.angle = init.angle;

    this.draw = function(ctx) {
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(Math.cos(this.angle / 180 * Math.PI) * -20 + this.x, 
            Math.sin(this.angle / 180 * Math.PI) * -20 + this.y);
    }
}

function Player(initPack) {
    this._id = initPack._id;
    this.name = initPack.name;
    this.x = initPack.x;
    this.y = initPack.y;
    this.angle = initPack.angle;
    this.color = initPack.color;
    this.bullets = initPack.bullets;
    this.alive = true;

    this.draw = function(ctx) {
        ctx.strokeStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(Math.cos(this.angle / 180 * Math.PI) * 20 + this.x, 
            Math.sin(this.angle / 180 * Math.PI) * 20 + this.y);

        for (bullet in this.bullets) {
            this.bullets[bullet].draw(ctx);
        }
        ctx.stroke();
    }

    this.setPos = function(x, y) {
        this.x = x;
        this.y = y;
    }
}

function drawMap(ctx, map) {
    ctx.fillStyle = "#555555";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    for(var wall in map.walls) {
        ctx.fillRect(map.walls[wall].x, map.walls[wall].y, map.walls[wall].w, map.walls[wall].h);
    }
    ctx.stroke();
    for(var spawn of map.spawnpoints) {
        ctx.beginPath();
        ctx.strokeStyle = spawn.color;
        ctx.lineWidth = 0;
        ctx.arc(spawn.x, spawn.y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = spawn.color;
        ctx.fill();
        // ctx.lineWidth = 5;
        // ctx.strokeStyle = '#003300';
        ctx.stroke();
    }
}

function updateTable(data) {
    document.getElementById('players').innerHTML = '';
    var table = document.createElement("table");
    table.setAttribute('id', 'player_list');
    table.innerHTML = 
    '<tr>' + 
        '<th>#</th>' + 
        '<th>Username</th>' + 
        '<th>Points</th>' + 
    '</tr>'; 
    
    var num = 1;
    for(var player in data) {
        var tr = document.createElement("tr");
        tr.innerHTML = `<th scope="row">${num}</th>
        <th style="color: ${players[player].color}">${players[player].name}</th>
        <th>${data[player].score}</th>`;
        num++;
        table.appendChild(tr);
    }
    document.getElementById('players').appendChild(table);
}

function createChat() {
    document.getElementById('chat').innerHTML = '';
    var form = document.createElement("form");
    form.setAttribute('id', 'chat_form');
    form.innerHTML = 
    `<div id="chat_text">
    </div>`;

    if(username == "" || accessToken == "" ||
    username == undefined || accessToken == undefined ||
    username == null || accessToken == null) {
        form.innerHTML += `Login to write messages`;
    } else {
        form.innerHTML += `<input id="chat_input" type="text"></input>`;
    }
    
    document.getElementById('chat').appendChild(form);
}

socket.on('init', (data) => {
    map = data.map;
    players = [];

    mapCreatorBtn.style.display = 'none';
    
    for (var i in data.players) {
        players[data.players[i]._id] = new Player(data.players[i]);
        
        for(var bullet in data.players[i].bullets) {
            players[data.players[i]._id].bullets[bullet] = new Bullet({
                _id: bullet,
                x: data.players[i].bullets[bullet].x,
                y: data.players[i].bullets[bullet].y,
                angle: data.players[i].bullets[bullet].angle,
            });
        }
    }
    // updateTable();
    createChat();

	var chatText = document.getElementById('chat_text');
	var chatInput = document.getElementById('chat_input');
	var chatForm = document.getElementById('chat_form');

    chatForm.onsubmit = (e) => {
        e.preventDefault();
        socket.emit('sendMsgToServer', chatInput.value);
        chatInput.value = '';
    }

    socket.on('addToChat', (data) => {
        chatText.innerHTML += 
        `<div id="message"><b style="float: left; color: ${data.color}">${data.name}: &nbsp </b><p>${data.message}</p></div>`;
    });

    _id = data.yourId;
    document.getElementById('center').innerHTML = 
    `<canvas id="ctx" width="${map.width}" height="${map.height}" style="border:1px solid #000000;"></canvas>`;
    
    ctx = document.getElementById("ctx").getContext("2d");
    ctx.fillStyle = "black";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;

    document.onkeydown = function(event) {
        if (event.keyCode === 68)	//d
            socket.emit('keyPress', {inputId: 'right', state: true});
        else if (event.keyCode === 83)	//s
            socket.emit('keyPress', {inputId: 'down', state: true});
        else if (event.keyCode === 65) //a
            socket.emit('keyPress', {inputId: 'left', state: true});
        else if (event.keyCode === 87) // w
            socket.emit('keyPress', {inputId: 'up', state: true});
            
    }
    document.onkeyup = function(event) {
        if (event.keyCode === 68)	//d
            socket.emit('keyPress', {inputId: 'right', state: false});
        else if (event.keyCode === 83)	//s
            socket.emit('keyPress', {inputId: 'down', state: false});
        else if (event.keyCode === 65) //a
            socket.emit('keyPress', {inputId: 'left', state: false});
        else if (event.keyCode === 87) // w
            socket.emit('keyPress', {inputId: 'up', state: false});
    }

    document.onmousedown = function(event){
        socket.emit('keyPress', {inputId: 'attack', state: true});
    }

    document.onmouseup = function(event){
        socket.emit('keyPress', {inputId: 'attack', state: false});
    }

    document.onmousemove = function(event){
        const offLeft = document.getElementById("ctx").offsetLeft;
        const offTop = document.getElementById("ctx").offsetTop;
        mouseX = -players[_id].x + event.clientX - offLeft;
        mouseY = -players[_id].y + event.clientY - offTop;
        
        socket.emit('keyPress', {inputId: 'mouseAngle', mouseX: mouseX, mouseY: mouseY});
    }

    setInterval(() => {
        ctx.fillStyle = '#000000';
        ctx.clearRect(0, 0, map.width, map.height);
        ctx.fillRect(0, 0, map.width, map.height);

        
        drawMap(ctx, map);
        for (var i in players) {
            if(players[i].alive) {
                players[i].draw(ctx);
            }
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffff00';
        ctx.font="10px Arial";
        // ctx.fillText("Ping: " + ping, 430, 7);
        // ctx.fillText("Server: " + serverTime, 100, 7);
        // ctx.fillText("Local: " + Date.now(), 100, 17);
        // ctx.fillText("Mouse(x, y) = " + (mouseX + players[_id].x) + ", " + (mouseY + players[_id].y), 400, 20);
    }, 1000/60);
});

socket.on('createObject', (data) => {
    switch(data.type) {
        case 'bullet':
            players[data.owner].bullets[data._id] = new Bullet({
                _id: data._id,
                x: data.x,
                y: data.y,
                angle: data.angle,
            });
            break;
        case 'player':
            players[data._id] = new Player(data);
            updateTable();
            break;
        default:
    }
});

socket.on('update', (data) => {
    for (var i in data.players) {
        players[data.players[i]._id].setPos(data.players[i].x, data.players[i].y);
        players[data.players[i]._id].angle = data.players[i].angle;
        players[data.players[i]._id].color = data.players[i].color;
        players[data.players[i]._id].alive = data.players[i].alive;

        for(bullet in players[data.players[i]._id].bullets) {
            players[data.players[i]._id].bullets[bullet].x = data.players[i].bullets[bullet].x;
            players[data.players[i]._id].bullets[bullet].y = data.players[i].bullets[bullet].y;
        }
    }
    serverTime = data.serverTime;
    ping = Date.now() - serverTime;
});

socket.on('removeObject', (data) => {
    switch(data.type) {
    case 'player':
        delete players[data._id];
        updateTable();
        break;
    case 'bullet':
        delete players[data.owner].bullets[data._id];
        break;
    }
});

socket.on('updateTable', (data) => {
    updateTable(data);
});

socket.on('restartGame', (data) => {
    for (var player in players) {
        players[player].bullets = {};
    }
});
