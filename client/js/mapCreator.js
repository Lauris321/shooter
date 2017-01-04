var creatorMap = {};
var players = [];

var wallForm = document.createElement("form");



function createMapCreatorUI() {
    var aside = document.getElementById('aside');

    var form = `
    <form id="wall_form">
        <label>Wall position</label>
        <div class="input-group">
            <input type="number" class="form-control" id="wall_x" placeholder="x" required>
            <span class="input-group-addon">-</span>
            <input type="number" class="form-control" id="wall_y" placeholder="y" required>
        </div>
        <label>Wall dimentions</label>
        <div class="input-group">
            <input type="number" class="form-control" id="wall_width" placeholder="width" required>
            <span class="input-group-addon">-</span>
            <input type="number" class="form-control" id="wall_height" placeholder="height" required>
        </div>
        <button type="submit" class="btn btn-default" id="add_wall_sub">Add Wall</button>
    </form>`;

    aside.innerHTML += form;
    wallForm = document.getElementById('wall_form');

    wallForm.onsubmit = (e) => {
        e.preventDefault();
        var x = document.getElementById('wall_x').value;
        var y = document.getElementById('wall_y').value;
        var width = document.getElementById('wall_width').value;
        var height = document.getElementById('wall_height').value;
        creatorMap.walls.push({
            "x": x,
            "y": y,
            "w": width,
            "h": height
        });
    }
}

function mapCreatorInit(data) {
    creatorMap = {
        "_id": data.name,
        "width": data.width,
        "height": data.height,
        "walls": [
            {
                "x": 0,
                "y": 0,
                "w": data.width,
                "h": 8
            },
            {
                "x": 0,
                "y": data.height - 8,
                "w": data.width,
                "h": 8
            },
            {
                "x": 0,
                "y": 0,
                "w": 8,
                "h": data.height
            },
            {
                "x": data.width - 8,
                "y": 0,
                "w": 8,
                "h": data.height
            }
        ]
    };
    players = [];

    document.getElementById('center').innerHTML = 
    `<canvas id="ctx" width="${data.width}" height="${data.height}" style="border:1px solid #000000;"></canvas>`;
    
    createMapCreatorUI();

    ctx = document.getElementById("ctx").getContext("2d");
    ctx.fillStyle = "black";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 3;

    document.onmousemove = function(event) {
        const offLeft = document.getElementById("ctx").offsetLeft;
        const offTop = document.getElementById("ctx").offsetTop;
        mouseX = event.clientX - offLeft;
        mouseY = event.clientY - offTop;
    }

    document.onmouseup = function(event){
        for(var wall of creatorMap['walls']) {
            if (mouseX > wall.x && mouseX < (wall.x + wall.w) &&
                mouseY > wall.y && mouseY < (wall.y + wall.h)) {
                creatorMap['walls'].splice(creatorMap['walls'].indexOf(wall), 1);
            }
        }
        socket.emit('keyPress', {inputId: 'attack', state: false});
    }

    setInterval(() => {
        ctx.fillStyle = '#000000';
        ctx.clearRect(0, 0, data.width, data.height);
        ctx.fillRect(0, 0, data.width, data.height);
        
        drawMap(ctx, creatorMap);
        for (var i in players) {
            players[i].draw(ctx);
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffff00';
        ctx.font="10px Arial";
        // ctx.fillText("Ping: " + ping, 430, 7);
        // ctx.fillText("Server: " + serverTime, 100, 7);
        // ctx.fillText("Local: " + Date.now(), 100, 17);
        ctx.fillText("Mouse(x, y) = " + mouseX + ", " + mouseY, 0, 7);
    }, 1000/60);
}

socket.on('mapCreatorInit', (data) => {
    
});