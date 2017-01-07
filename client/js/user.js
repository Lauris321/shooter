var logForm = document.getElementById('log_form');
var logAnswer = document.getElementById('log_answer');
var header = document.getElementById('main_header');

var username = localStorage.getItem("username");
var accessToken = localStorage.getItem("access_token");
var authorisation = '';

var allMapsBtn = document.getElementById("all_maps_button");
var changeCurrentMapBtn = document.getElementById("change_current_map_button");
var deleteMapBtn = document.getElementById("delete_map_button");
var changeUsersAuthBtn = document.getElementById("change_auth_button");
var statisticsBtn = document.getElementById("statistics_button");

statisticsBtn.onclick = function() {
    socket.emit('getStats', {name: username, accessToken: accessToken});
}

initUser();

function initUser() {
    socket.emit('authenticate', {name: username, accessToken: accessToken});
}

logForm.onsubmit = (e) => {
    e.preventDefault();
    var name = document.getElementById('log_user_input').value;
    var password = document.getElementById('log_pass_input').value;
    socket.emit('login', {name: name, password: password});
}

var regForm = document.getElementById('reg_form');
regForm.onsubmit = (e) => {
    e.preventDefault();
    var name = document.getElementById('user_input').value;
    var password = document.getElementById('pass_input').value;
    socket.emit('register', {name: name, password: password});
    regModal.style.display = "none";
}

var mapCreatorForm = document.getElementById('map_creator_form');
mapCreatorForm.onsubmit = (e) => {
    e.preventDefault();
    var mapName = document.getElementById('map_name').value;
    var width = document.getElementById('map_width').value;
    var height = document.getElementById('map_height').value;
    mapCreatorModal.style.display = "none";
    mapCreatorInit({name: mapName, width: width, height: height});
}

socket.on('loginData', (data) => {
    if(data.message === 'Logged in!') {
        localStorage.setItem("username", data.user);
        localStorage.setItem("access_token", data.access_token);
        username = localStorage.getItem("username");
        accessToken = localStorage.getItem("access_token");

        logModal.style.display = "none";
        socket.emit('authenticate', {name: username, accessToken: accessToken});
    } else {
        logAnswer.innerText = data.message;
    }
});

socket.on('authenticateRes', (data) => {
    if (data === 'admin') {
        regBtn.style.display = "none";
        logBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        mapCreatorBtn.style.display = "inline-block";
        allMapsBtn.style.display = "inline-block";
        changeCurrentMapBtn.style.display = "inline-block";
        deleteMapBtn.style.display = "inline-block";
        changeUsersAuthBtn.style.display = "inline-block";
        statisticsBtn.style.display = "inline-block";
        usernameSpan.innerHTML = "User: " + username;
    } else if (data === 'user') {
        regBtn.style.display = "none";
        logBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        statisticsBtn.style.display = "inline-block";
        usernameSpan.innerHTML = "User: " + username;
    } else {
        regBtn.style.display = "inline-block";
        logBtn.style.display = "inline-block";
    }
});

socket.on('getStatsRes', (data) => {
    console.log(data);
    var table = document.createElement("table");
    table.setAttribute('class', 'table table-hover');
    table.setAttribute('id', 'maps_list');
    table.setAttribute('width', '300px');
    document.getElementById("article").innerHTML = 
    `<caption>User statistics:</caption>
    <thead> 
        <tr> 
            <th>Name</th>
            <th>Max Players</th>
        </tr> 
    </thead>`;
    var tr = ``;
        tr += 
        `<tr>
            <td>Total shots fired</td>
            <td>${data.totalShotsFired}</td>
        </tr>
        <tr>
            <td>Total hits</td>
            <td>${data.totalHits}</td>
        </tr>
        <tr>
            <td>Total deaths</td>
            <td>${data.totalDeaths}</td>
        </tr>`;
    table.innerHTML += tr;
    document.getElementById("article").innerHTML = "";
    document.getElementById("article").appendChild(table);
});

