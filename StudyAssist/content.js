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
var state = undefined;

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
    // console.log("key press");
    //increase count
    if (state === "study"){
        keyCount += 1;
    }
    
});
document.addEventListener('click', (event) => {
    // console.log("click");
    //increase count
    if (state === "study"){
        clickCount += 1;
        timeSinceClick = 0;
    }
});

if(!pause){
    //Get the time out of storage
    chrome.storage.sync.get(['popupData'], function(result) {
        if(!(result.popupData === undefined || result.popupData === null || result.popupData.length === 0)){
            var popupData = JSON.parse(result.popupData);
            // if study timer white
            if (popupData.state == "study"){
                timerPlace.style.color = "#fff";
                state = "study";
            }
            // if break timer blue
            if (popupData.state == "break" || popupData.state === "Long break"){
                timerPlace.style.color = "#11FFEF";
            }   
            
            //set end time
            var endTimeString = popupData.endTime;
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

                        if (additionalTime == 1) additionalTime += 1; //count additional time used

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

                        //when timer ends
                        if(dist <= 0){
                            answer = confirm("Timer has ended. Continue to next stage of your session? Cancel will postpone this message and add two minutes.");
                            if(answer){ //Stop the timer, continue to next stage

                                clearInterval(stID);
                                timerPlace.innerHTML = "";
                                document.body.prepend(timerPlace);

                                //Store that the time has ended
                                chrome.storage.sync.get(['popupData'], function(result) {
                                    if(!(result.popupData === undefined || result.popupData === null || result.popupData.length === 0)){
                                        var popupData = JSON.parse(result.popupData);
                                        if(popupData.state === "study"){
                                            if (additionalTime <= 1){//if no over time, then increment the state counts (because it has already been done in overtime check)
                                                popupData.numStudy = (popupData.numStudy) ? (parseInt(popupData.numStudy) + 1) : 1; //get the current number of completed study periods and increment
                                                
                                                // save time without over time
                                                prevTime = popupData.timeStudied ? parseFloat(popupData.timeStudied): 0;  //get the previous time studied //TODO: test accuracy with mutliple windows
                                                
                                                console.log("additionalTime <= 1 prev: ", prevTime); 

                                                popupData.timeStudied = prevTime //add on the time for the session that just finished
                                                                    + parseFloat(popupData.studyMin); //current amount for the timer

                                                console.log(popupData.timeStudied);

                                                //add saved counts to current count
                                                popupData.keyCount = (popupData.keyCount) ? (parseInt(popupData.keyCount) + keyCount) : keyCount;
                                                popupData.clickCount = (popupData.clickCount) ? (parseInt(popupData.clickCount) + clickCount) : clickCount;

                                                // Reset the local counts
                                                keyCount = 0;
                                                clickCount = 0;

                                                console.log("additionalTime <= 1 popupData.keyCount: " + popupData.keyCount + " and popupData.clickCount: " + popupData.clickCount);

                                            }else{ //if there has been over time, only save the overtime becuase the timer amount has already been saved
                                                prevTime = popupData.timeStudied ? parseFloat(popupData.timeStudied): 0;  //get the previous time studied //TODO: test accuracy with mutliple windows
                                                
                                                console.log("timer end else prev: ", prevTime); 

                                                popupData.timeStudied = prevTime //add on the time for the session that just finished
                                                                    + (additionalTime * 0.016667); //convert overtime to fractions of a minute

                                                console.log(popupData.timeStudied);

                                                //add saved counts to current count
                                                popupData.keyCount = (popupData.keyCount) ? (parseInt(popupData.keyCount) + keyCount) : keyCount;
                                                popupData.clickCount = (popupData.clickCount) ? (parseInt(popupData.clickCount) + clickCount) : clickCount;

                                                // Reset the local counts
                                                keyCount = 0;
                                                clickCount = 0;

                                                console.log("timer end else popupData.keyCount: " + popupData.keyCount + " and popupData.clickCount: " + popupData.clickCount);
                                            }
                                        }else if (popupData.state === "break"){

                                            if (additionalTime <= 1){//if no over time, then increment the state counts (because it has already been done in overtime check)
                                                popupData.numBreak = (popupData.numBreak) ? (parseInt(popupData.numBreak) + 1) : 1; //get the current number of completed short breaks and increment
                                            }

                                        }else if (popupData.state === "Long break"){

                                            if (additionalTime <= 1){//if no over time, then increment the state counts (because it has already been done in overtime check)
                                                popupData.numLongBreak = (popupData.numLongBreak) ? (parseInt(popupData.numLongBreak) + 1) : 1; //get the current number of completed long breaks and increment 
                                            }
                                        
                                        }
                                        //set popup state to be between study/break
                                        popupData.state = "intermission";
                                        popupData.endTime = undefined;
                                        let serializedTimer = JSON.stringify(popupData);
                                        chrome.storage.sync.set({"popupData": serializedTimer}, function() {
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
                                additionalTime += 1; 
                                timerPlace.style.color = "#f00"; // turn red
                                // but the state of popup is intermission becuase they can end any time and continue to the next state
                                chrome.storage.sync.get(['popupData'], function(result) {
                                    if(!(result.popupData === undefined || result.popupData === null || result.popupData.length === 0)){
                                        var popupData = JSON.parse(result.popupData);
                                        // Set the state of popup to be intermission so they can end any time and continue to the next state
                                        if(popupData.state === "study"){
                                            popupData.numStudy = (popupData.numStudy) ? (parseInt(popupData.numStudy) + 1) : 1;

                                            prevTime = popupData.timeStudied ? parseFloat(popupData.timeStudied): 0;  //get the previous time studied //TODO: test accuracy with mutliple windows
                                            
                                            console.log("postpone save prev: ", prevTime); 

                                            popupData.timeStudied = prevTime //add on the time for the session that just finished
                                                                + parseFloat(popupData.studyMin); //current amount for the timer

                                            console.log(popupData.timeStudied);

                                            //add saved counts to current count
                                            popupData.keyCount = (popupData.keyCount) ? (parseInt(popupData.keyCount) + keyCount) : keyCount;
                                            popupData.clickCount = (popupData.clickCount) ? (parseInt(popupData.clickCount) + clickCount) : clickCount;

                                            // Reset the local counts
                                            keyCount = 0;
                                            clickCount = 0;

                                            console.log("postpone save popupData.keyCount: " + popupData.keyCount + " and popupData.clickCount: " + popupData.clickCount);

                                        }else if (popupData.state === "break"){
                                            popupData.numBreak = (popupData.numBreak) ? (parseInt(popupData.numBreak) + 1) : 1;

                                        }else if (popupData.state === "Long break"){
                                            popupData.numLongBreak = (popupData.numLongBreak) ? (parseInt(popupData.numLongBreak) + 1) : 1;
                                        }

                                        //set popup state to be between study/break
                                        popupData.state = "intermission";
                                        popupData.endTime = undefined;
                                        let serializedPopupData = JSON.stringify(popupData);
                                        chrome.storage.sync.set({"popupData": serializedPopupData}, function() {
                                            // console.log('Content: Value is set to ' + serializedTimer);
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
