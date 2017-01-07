allMapsBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'chooseMap', accessToken: accessToken});
}

changeCurrentMapBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'changeMap', accessToken: accessToken});
}

deleteMapBtn.onclick = function() {
    socket.emit('getAllMaps', {name: username, function: 'deleteMap', accessToken: accessToken});
}

changeUsersAuthBtn.onclick = function() {
    socket.emit('getAllUsers', {name: username, accessToken: accessToken});
}

socket.on('allMapsRes', (data) => {
    initAllMapsList(data);
});

socket.on('allUsersRes', (data) => {
    initAllUsersList(data);
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

function changeAuth(user) {
    socket.emit('changeAuth', {auth: document.getElementById(user).value, 
        user: user, name: username, accessToken: accessToken});
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

function initAllUsersList(users) {
    var table = document.createElement("table");
    table.setAttribute('class', 'table table-hover');
    table.setAttribute('id', 'maps_list');
    table.innerHTML = 
    `<caption>Choose map:</caption>
    <thead> 
        <tr> 
            <th>Username</th>
            <th>Authorisation</th>
        </tr> 
    </thead>`;
    var tr = ``;
    for(var user of users) {
        switch(user.auth) {
        case 'admin':
            tr += 
            `<tr>
                <td>${user._id}</td>
                <td>
                    <select id="${user._id}" onchange="changeAuth('${user._id}')">
                        <option selected="selected" value="admin">Administrator</option>
                        <option value="user">User</option>
                    </select>
                </td>
            </tr>`;
            break;
        case 'user':
            tr += 
            `<tr>
                <td>${user._id}</td>
                <td>
                    <select id="${user._id}" onchange="changeAuth('${user._id}')">
                        <option value="admin">Administrator</option>
                        <option selected="selected" value="user">User</option>
                    </select>
                </td>
            </tr>`;
            break;
        }
    }
    table.innerHTML += tr;
    document.getElementById("article").innerHTML = "";
    document.getElementById("article").appendChild(table);
}

socket.on('getMapRes', (data) => {
    data.edit = true;
    mapCreatorInit(data);
});

