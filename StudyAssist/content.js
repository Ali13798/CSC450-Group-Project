var timerPlace = document.createElement("div");
timerPlace.style.fontSize = "40px";
timerPlace.style.fontFamily = "Roboto !important";
timerPlace.style.position = "fixed";
timerPlace.style.bottom = "10px";
timerPlace.style.right = "10px";
timerPlace.style.fontWeight = "bold";
timerPlace.style.zIndex = "10000000";
timerPlace.style.backgroundColor = "#000";
timerPlace.style.color = "#fff";
timerPlace.style.padding = "10px";
timerPlace.style.opacity = "0.5";

var endTime;

function getTimerEndTime(min){
    console.log("making date");
    var countDownTime = new Date().getTime();
    countDownTime = new Date(countDownTime + min*60000);    
    endTime = countDownTime;
    timerFunction(endTime);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.timerMessage === "EndTime"){
            mins = request.mins;
            getTimerEndTime(mins); 
        }else if (!(endTime === undefined || endTime === null) && (request.timerMessage === "reloadTimer")){
            //call timer function
            timerFunction();
        }
    }
);


function timerFunction(){
    var stID = setInterval(function() {
        var now = new Date().getTime();
        var dist = endTime - now;
        var hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((dist % (1000 * 60)) / 1000);
        timerPlace.innerHTML = hours + ":" + minutes + ":" + seconds;
        document.body.prepend(timerPlace);
        if(dist <= 0){
            clearInterval(stID);
            timerPlace.innerHTML = "0:0:0";
            document.body.prepend(timerPlace);
            //send message to popup that the timer ended
            chrome.runtime.sendMessage({timerMessage: "TimerEnd"}, function(response) {
            });
            return;
        }
    }, 1000);
}
