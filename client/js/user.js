var logForm = document.getElementById('log_form');
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
}

socket.on('loginData', (data) => {
    console.log(data);
    if(data.message === 'Logged in!') {
        localStorage.setItem("username", data.user);
        localStorage.setItem("access_token", data.access_token);
    }
});
