var regModal = document.getElementById('regModal');
var logModal = document.getElementById('logModal');
var mapCreatorModal = document.getElementById('map_creator_modal');

// Get the button that opens the modal
var regBtn = document.getElementById("reg_button");
var logBtn = document.getElementById("log_button");
var logoutBtn = document.getElementById("logout_button");
var mapCreatorBtn = document.getElementById("map_creator_button");

var usernameSpan = document.getElementById('username_span');

// Get the <span> element that closes the modal
var regSpan = document.getElementById("reg_close");
var logSpan = document.getElementById("log_close");
var mapCreatorSpan = document.getElementById("map_creator_close");

// When the user clicks on the button, open the modal 
regBtn.onclick = function() {
    regModal.style.display = "block";
}

logBtn.onclick = function() {
    logModal.style.display = "block";
}

logoutBtn.onclick = function() {
    localStorage.setItem("username", "");
    localStorage.setItem("access_token", "");
    regBtn.style.display = "inline-block";
    logBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    mapCreatorBtn.style.display = "none";
    usernameSpan.innerText = "";
    location.reload();
}

mapCreatorBtn.onclick = function() {
    mapCreatorModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
regSpan.onclick = function() {
    regModal.style.display = "none";
}

logSpan.onclick = function() {
    logModal.style.display = "none";
}

mapCreatorSpan.onclick = function() {
    mapCreatorModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == regModal) {
        regModal.style.display = "none";
    } else if(event.target == logModal) {
        logModal.style.display = "none";
    } else if(event.target == mapCreatorModal) {
        mapCreatorModal.style.display = "none";
    }
}