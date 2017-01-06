var chosenMap = localStorage.getItem("chosenMap");

if(chosenMap == "" || chosenMap == undefined || chosenMap == null) {
    
} else {
    allMapsBtn.innerHTML = `Selected: ${chosenMap}`;
}

allMapsBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, accessToken: accessToken});
}

socket.on('allMapsRes', (data) => {
    initAllMapsList(data);
});

function chooseMap(mapName) {
    chosenMap = mapName;
    localStorage.setItem("chosenMap", chosenMap);
    allMapsBtn.innerHTML = `Selected: ${chosenMap}`;
}

function initAllMapsList(maps) {
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
    for(var map in maps) {
        tr += 
        `<tr onclick="chooseMap('${maps[map]._id}')">
            <td>${maps[map]._id}</td>
            <td>${maps[map].maxplayers}</td>
        </tr>`;
        
    }
    table.innerHTML += tr;
    document.getElementById("article").innerHTML = "";
    document.getElementById("article").appendChild(table);
}