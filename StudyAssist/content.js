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
timerPlace.innerHTML="";

var endTime, additionalTime = 0;
var pause = false;
var pauseStart = null;
var pauseEnd = null;
var clickCount= 0, keyCount= 0;
var timeSinceClick = 0;
var timetowaitforclick = 180;

//Listen for message about pausing the timer
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.message === "pause"){
        pauseFunc();
        sendResponse({farewell: "paused or unpaused"});
      }
    }
);
function pauseFunc(){
    //flip pause
    pause = !pause;
    if(pause){
        pauseStart = new Date();
        //replace current timer with "paused"
        timerPlace.innerHTML = "Paused";
    }else{//pause end
        pauseEnd = new Date();
        timerPlace.innerHTML = "";
    }
}

//When a key is pressed, add to count
document.addEventListener('keydown', (event) => {
    console.log("key press");
      //increase count
      keyCount += 1;
});
document.addEventListener('click', (event) => {
    console.log("click");
      //increase count
    clickCount += 1;
    timeSinceClick = 0;
});

if(!pause){
    //Get the time out of storage
    chrome.storage.sync.get(['popupState'], function(result) {
        if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
            var popupState = JSON.parse(result.popupState);
            // if study timer white
            if (popupState.state == "study"){
                timerPlace.style.color = "#fff";
            }
            // if break timer orange
            if (popupState.state == "break" || popupState.state === "Long break"){
                timerPlace.style.color = "#11FFEF";
            }   
            
            //set end time
            var endTimeString = popupState.endTime;
            if(!(endTimeString === undefined || endTimeString === null || endTimeString.length === 0)){
                var endTimeArray = endTimeString.split(" ");
                endTime = new Date();
                endTime.setHours(parseInt(endTimeArray[0]));
                endTime.setMinutes(parseInt(endTimeArray[1]));
                endTime.setSeconds(parseInt(endTimeArray[2]));

                //run timer
                var stID = setInterval(function() {
                    //add time to click
                    timeSinceClick += 1;
                    if (timeSinceClick > timetowaitforclick){ //if more than 3 minutes have gone by
                        pauseFunc();
                        alert("No mouse clicks registered recently. Please keep working or pause.");
                        pauseFunc();
                        timeSinceClick = 0;
                    }
                    //if not paused, continue timer
                    if(!(timerPlace.innerHTML == "Paused")){
                        //check if it has been paused previously
                        if(pauseStart) {//if there is a date in start pause, then it has been paused
                            //get how long it has been paused
                            timePaused = pauseEnd.getTime() - pauseStart.getTime();
                            //add to end timer time
                            endTime = new Date(endTime.getTime() + timePaused);
                            //clear start and end pause
                            pauseStart = null;
                            pauseEnd = null;
                        }
                        var now = new Date().getTime();
                        var dist = endTime - now;
                        var hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        var minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                        var seconds = Math.floor((dist % (1000 * 60)) / 1000);
                        timerPlace.innerHTML = hours + ":" + minutes + ":" + seconds;
                        document.body.prepend(timerPlace);
                        //when timer is over
                        if(dist <= 0){
                            answer = confirm("Timer has ended. Continue to next stage of your session? Cancel will postpone this message and continue the timer.");
                            if(answer){ //Stop the timer, continue to next stage
                                clearInterval(stID);
                                timerPlace.innerHTML = "";
                                document.body.prepend(timerPlace);
                                //Store that the time has ended
                                chrome.storage.sync.get(['popupState'], function(result) {
                                    if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
                                        var popupState = JSON.parse(result.popupState);
                                        if(popupState.state === "study"){
                                            popupState.numStudy = (popupState.numStudy) ? (parseInt(popupState.numStudy) + 1) : 1;
                                            popupState.timeStudied = popupState.studyMin + additionalTime;
                                        }else if (popupState.state === "break"){
                                            popupState.numBreak = (popupState.numBreak) ? (parseInt(popupState.numBreak) + 1) : 1;
                                        }else if (popupState.state === "Long break"){
                                            popupState.numLongBreak = (popupState.numLongBreak) ? (parseInt(popupState.numLongBreak) + 1) : 1;
                                        }
                                        //add counts to current count
                                        if (popupState.keyCount === null || popupState.keyCount === undefined){
                                            popupState.keyCount = keyCount;
                                        }else{
                                            popupState.keyCount += parseInt(popupState.keyCount) + keyCount;
                                        }
                                        if (popupState.clickCount === null || popupState.clickCount === undefined){
                                            popupState.clickCount = clickCount;
                                        }else{
                                            popupState.clickCount += parseInt(popupState.clickCount) + clickCount;
                                        }
                                        keyCount = 0;
                                        clickCount = 0;

                                        console.log("popupState.keyCount and popupState.clickCount" + popupState.keyCount + popupState.clickCount);

                                        //set popup state to be between study/break
                                        popupState.state = "intermission";
                                        popupState.endTime = undefined;
                                        let serializedTimer = JSON.stringify(popupState);
                                        chrome.storage.sync.set({"popupState": serializedTimer}, function() {
                                            console.log('Content: Value is set to ' + serializedTimer);
                                        });

                                        //stop blocking
                                        const enabled = false;
                                        chrome.storage.local.set({ enabled });
                                    }
                                })
                                return;
                            }else{ 
                                //add 2 minutes to the timer
                                endTime.setMinutes(new Date().getMinutes() + 2);
                                additionalTime += 2;
                                // turn red
                                timerPlace.style.color = "#f00";
                                // but the state of popup is intermission becuase they can end any time and continue to the next state
                                chrome.storage.sync.get(['popupState'], function(result) {
                                    if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
                                        var popupState = JSON.parse(result.popupState);
                                        if(popupState.state === "study"){
                                            popupState.numStudy = (popupState.numStudy) ? (parseInt(popupState.numStudy) + 1) : 1;
                                        }else if (popupState.state === "break"){
                                            popupState.numBreak = (popupState.numBreak) ? (parseInt(popupState.numBreak) + 1) : 1;
                                        }else if (popupState.state === "Long break"){
                                            popupState.numLongBreak = (popupState.numLongBreak) ? (parseInt(popupState.numLongBreak) + 1) : 1;
                                        }
                                        //set popup state to be between study/break
                                        popupState.state = "intermission";
                                        popupState.endTime = undefined;
                                        let serializedTimer = JSON.stringify(popupState);
                                        chrome.storage.sync.set({"popupState": serializedTimer}, function() {
                                            console.log('Content: Value is set to ' + serializedTimer);
                                        });
                                    }
                                })

                            }
                            
                        }
                    }else{
                        //do not display timer
                    }
                }, 1000);
            }
        }
    })
}
