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


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.timerMessage === "EndTime"){
            //if there were minutes send, make the end time obj
            if(!(request.endTimeString == "undefined" || request.endTimeString === undefined ||
            request.endTimeString === null || request.endTimeString == "null" )){
                // console.log("mins = "+ request.endTimeString);
                //set end time
                var endTimeString = request.endTimeString;
                var endTimeArray = endTimeString.split(" ");
                endTime = new Date();
                endTime.setHours(parseInt(endTimeArray[0]));
                endTime.setMinutes(parseInt(endTimeArray[1]));
                endTime.setSeconds(parseInt(endTimeArray[2]));
                // console.log("endTIme not null = " + endTime);
                timerFunction();
            }
        }if (request.timerMessage === "loadTime"){
            // console.log("in content loadTime listener " + endTime);
            //if there is a time
            if(!(endTime == "undefined" || endTime === undefined || endTime === null || endTime == "null" )){
                // console.log("endTIme not null = " + endTime);
                timerFunction();
            }
            
        }
    }
);


function timerFunction(){
    console.log("in timer function where endTime= " + endTime);
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
            chrome.runtime.sendMessage({timerMessage: "endSession"}, function(response) {
            });
            return;
        }
    }, 1000);
}
