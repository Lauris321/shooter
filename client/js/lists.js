allMapsBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'chooseMap', accessToken: accessToken});
}

changeCurrentMapBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'changeMap', accessToken: accessToken});
}

deleteMapBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'deleteMap', accessToken: accessToken});
}

socket.on('allMapsRes', (data) => {
    initAllMapsList(data);
});

function chooseMap(mapName) {
    mapCreatorInit(mapName);
    socket.emit('getMap', {mapName: mapName, name: username, accessToken: accessToken});
}

function changeMap(mapName) {
    socket.emit('changeMap', {mapName: mapName, name: username, accessToken: accessToken});
}

function deleteMap(mapName) {
    socket.emit('deleteMap', {mapName: mapName, name: username, accessToken: accessToken});
}

function initAllMapsList(data) {
    var table = document.createElement("table");
    table.setAttribute('class', 'table table-hover');
    table.setAttribute('id', 'maps_list');
    table.innerHTML = 
    `<caption>Choose map:</caption>
    <thead> 
        <tr> 
            <th>Name</th>
            <th>Max Players</th>
        </tr> 
    </thead>`;
    var tr = ``;
    for(var map in data.maps) {
        tr += 
        `<tr onclick="${data.function}('${data.maps[map]._id}')">
            <td>${data.maps[map]._id}</td>
            <td>${data.maps[map].maxplayers}</td>
        </tr>`;
        
    }
    table.innerHTML += tr;
    document.getElementById("article").innerHTML = "";
    document.getElementById("article").appendChild(table);
}

socket.on('getMapRes', (data) => {
    data.edit = true;
    mapCreatorInit(data);
});