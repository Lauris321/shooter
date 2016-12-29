var regModal = document.getElementById('regModal');
var logModal = document.getElementById('logModal');

// Get the button that opens the modal
var regBtn = document.getElementById("reg_button");
var logBtn = document.getElementById("log_button");

// Get the <span> element that closes the modal
var regSpan = document.getElementById("reg_close");
var logSpan = document.getElementById("log_close");

// When the user clicks on the button, open the modal 
regBtn.onclick = function() {
    regModal.style.display = "block";
}

logBtn.onclick = function() {
    logModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
regSpan.onclick = function() {
    regModal.style.display = "none";
}

logSpan.onclick = function() {
    logModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == regModal) {
        regModal.style.display = "none";
    } else if(event.target == logModal) {
        logModal.style.display = "none";
    }
}