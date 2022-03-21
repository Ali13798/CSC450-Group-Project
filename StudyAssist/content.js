var timerPlace = document.createElement("div");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("here");
      if (request.message.includes("Timer")) {
        //get timer information
        var timerInfoArray = timerOp.value.split("/");
        var studyMin = timerInfoArray[1];
        var shortBkMin = timerInfoArray[2];
        var cycleNum = timerInfoArray[3];
        var longBkMin = timerInfoArray[4];
        //call timer manager
        timerManager(studyMin, shortBkMin, cycleNum, longBkMin);
        sendResponse({status: "done"});
      }
    }
);

// chrome.runtime.onMessage.addListener((msg) => {
//     console.log("in content");
//     if(msg.message.includes("Timer")){
//         //get timer information
//         var timerInfoArray = timerOp.value.split("/");
//         var studyMin = timerInfoArray[1];
//         var shortBkMin = timerInfoArray[2];
//         var cycleNum = timerInfoArray[3];
//         var longBkMin = timerInfoArray[4];
//         //call timer manager
//         timerManager(studyMin, shortBkMin, cycleNum, longBkMin);
//     }
//     return true;  
// });

function timerManager(studyMin, shortBkMin, cycleNum, longBkMin){
    //TODO: Finish this to do all forms of the timer
    var timerDone = timerFunction(studyMin);
    if(timerDone){
        alert("Timer Done!");
    }
}

//Timer function
function timerFunction(min){
    var countDownTime = new Date().getTime();
    countDownTime = new Date(countDownTime + min*60000);
    var xSec = setInterval(function() {
        var now = new Date().getTime();
        var dist = countDownTime - now;
        var hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((dist % (1000 * 60)) / 1000);
        timerPlace.innerHTML = hours + ":" + minutes + ":" + seconds;
        document.body.append(timerPlace);
        if(dist <= 0){
            return true;
        }
    }, 1000);
}