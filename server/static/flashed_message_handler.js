window.onload = function () {
    var fmd = document.getElementById("flashed-message-div");
    var fm = document.getElementById("flashed-message");
    if (fm.textContent != "") {
        fmd.appendChild(fm);
    }
};
