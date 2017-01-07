var lobbyInfo = {
    connectonsNum: 0,
}

function enterLobby() {
    const chosenName = document.getElementById('name_input').value;
    socket.emit('enterLobby', {name: chosenName, user: username, accessToken: accessToken});
}

socket.on('lobbyInfo', (data) => {
    lobbyInfo = data;
    
    // document.getElementById('conn_num').innerHTML = 'Number of connections: ' + lobbyInfo.connectonsNum;
});

