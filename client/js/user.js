var logForm = document.getElementById('log_form');
var logAnswer = document.getElementById('log_answer');

var username = localStorage.getItem("username");
var accessToken = localStorage.getItem("access_token");



if(username === "" || accessToken === "") {
    logoutBtn.style.display = "none";
} else {
    regBtn.style.display = "none";
    logBtn.style.display = "none";
    usernameSpan.innerHTML = "User: " + username;
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

socket.on('loginData', (data) => {
    if(data.message === 'Logged in!') {
        localStorage.setItem("username", data.user);
        localStorage.setItem("access_token", data.access_token);
        logModal.style.display = "none";
        regBtn.style.display = "none";
        logBtn.style.display = "none";
        logoutBtn.style.display = "block";
        usernameSpan.innerText = username;
    } else {
        logAnswer.innerText = data.message;
    }
});