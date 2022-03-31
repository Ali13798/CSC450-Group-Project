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

var endTime;

console.log("in timer function where endTime= " + endTime);
//Get the timer out of storage
chrome.storage.sync.get(['popupState'], function(result) {
    if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
        var popupState = JSON.parse(result.popupState);
        //set end time
        var endTimeString = popupState.endTime;
        if(!(endTimeString === undefined || endTimeString === null || endTimeString.length === 0)){
            console.log("int timer= " + endTime);
            var endTimeArray = endTimeString.split(" ");
            endTime = new Date();
            endTime.setHours(parseInt(endTimeArray[0]));
            endTime.setMinutes(parseInt(endTimeArray[1]));
            endTime.setSeconds(parseInt(endTimeArray[2]));

            //run timer
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
                    timerPlace.innerHTML = "";
                    document.body.prepend(timerPlace);
                    //Store that the time has ended
                    chrome.storage.sync.get(['popupState'], function(result) {
                        if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
                            var popupState = JSON.parse(result.popupState);
                            popupState.state = "mainpg";
                            popupState.endTime = "";
                            let serializedTimer = JSON.stringify(popupState);
                            chrome.storage.sync.set({"popupState": serializedTimer}, function() {
                                console.log('Value is set to ' + serializedTimer);
                            });
                            const enabled = false;
                            chrome.storage.local.set({ enabled });
                        }
                    })
                    return;
                }
            }, 1000);
        }
    }
})

