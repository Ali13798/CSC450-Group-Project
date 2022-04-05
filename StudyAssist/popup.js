var timer = {}; //global object for storing ifnormation about the timer
var timeMessage;
var numStudy, numBreak, numLongBreak;
var Stime, Btime, LBtime, Cnum;
//HTML element variables
var popCont;
var websiteBtn;
var timerDiv;
var textarea;
var save;
var radioButtons;
var custSessionInputs;
var beginButton;
var endButton;
var optionsBtn;
var popWebsites;
var pauseBtn;
var nextStep;


//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    //Variables 
    popCont = document.getElementById("popupContainer");
    websiteBtn = document.getElementById("websiteBtn");
    timerDiv = document.getElementById("timerOptions");
    textarea = document.getElementById("textarea");
    save = document.getElementById("save");
    radioButtons = document.getElementById("radioButtons");
    custSessionInputs = document.getElementById("custSessionInputs");
    beginButton = document.getElementById("beginSession");
    endButton = document.getElementById("endSession");
    optionsBtn = document.getElementById("optionsBtn");
    popWebsites = document.getElementById("popWebsites");
    pauseBtn = document.getElementById("pauseBtn");
    nextStep = document.getElementById("nextStep");
    //Website    
    websiteBtn.addEventListener("click", () =>{
        chrome.tabs.create({url: chrome.runtime.getURL("home-site.html") });
    });

    //if the title is welcome, then clear some info from storage
    if(PgTitle.innerHTML == "Welcome!"){
        //TODO: decide what to remove or change

        //for now, just make sure blocking is off
        const enabled = false;
        chrome.storage.local.set({ enabled });
    }

    //Load previous session data if any
    chrome.storage.sync.get(['popupState'], function(result) {
        if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
            //if there is data load it in, get it as a string
            var popupState = JSON.parse(result.popupState);
            if(popupState){
                //load vars keeping track of num of study and breaks
                numStudy = popupState.numStudy;
                numBreak = popupState.numBreak;
                numLongBreak = popupState.numLongBreak;
                Stime = popupState.studyMin;
                Btime = popupState.shortBkMin;
                LBtime = popupState.longBkMin;
                Cnum = popupState.cycleNum;

                //Check if in study state
                if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "study"){
                    //display it is in study mode
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Study Mode";
                    //hide timer options
                    const enabled = true;
                    chrome.storage.local.set({ enabled });
                    console.log("in study state");
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline";
                    pauseBtn.style.display = "inline";
                    nextStep.style.display = "none";
                }
                //check if in intermission state
                if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "intermission"){
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Intermission";
                    console.log("in intermission state");
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline";
                    pauseBtn.style.display = "none";
                    nextStep.style.display = "inline";
                }
                //check if in main page menu state
                if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "mainpg"){
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Main Menu";
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "block";
                    beginButton.style.display = "inline";
                    pauseBtn.style.display = "none";
                    nextStep.style.display = "none";
                    endButton.style.display = "none";
                }

                if(!(popupState.newBlockedPg === undefined || popupState.newBlockedPg === null || popupState.newBlockedPg.length === 0)){
                    if (popupState.newBlockedPg == true){
                        var url = popupState.lastBlockedPage;
                        //get the domain from the url
                        var domain = (new URL(url)).hostname;
                        message = "Access to the following page is not permitted during study mode:\n" + url 
                                    + "\nAllow this domain? " + domain;
                        popupState.newBlockedPg = false;
                        popupState.lastBlockedPage = "";
                        saveToStorage(popupState);
                        answer = confirm(message);
                        if(answer){
                            //Add it to the whitelist
                            
                            //get list from storage
                            chrome.storage.local.get(["blocked"], function (local) {
                                const blocked = local;
                                if (Array.isArray(blocked.blocked)) {
                                    textarea.value = blocked.blocked.join("\n");
                                }
                                textarea.value += "\n" + domain;
                                save.click();
                            });
                        }
                    }
                }
                //Populate choices for custom timer
                if(!(popupState.choiceid === undefined || popupState.choiceid === null || popupState.choiceid.length === 0)){
                    //choice is the id of the element to set to be checked
                    document.getElementById(popupState.choiceid).checked = true;
                }
                if(!(popupState.studyMin === undefined || popupState.studyMin === null || popupState.studyMin.length === 0)){
                    document.getElementById("studyMin").value = popupState.studyMin;
                }
                if(!(popupState.shortBkMin === undefined || popupState.shortBkMin === null || popupState.shortBkMin.length === 0)){
                    document.getElementById("shortBkMin").value = popupState.shortBkMin;
                }
                if(!(popupState.cycleNum === undefined || popupState.cycleNum === null || popupState.cycleNum.length === 0)){
                    document.getElementById("cycleNum").value = popupState.cycleNum;
                }
                if(!(popupState.longBkMin === undefined || popupState.longBkMin === null || popupState.longBkMin.length === 0)){
                    document.getElementById("longBkMin").value = popupState.longBkMin;
                }
                
            }
            
        } 
    });
    //saves the list of blocked sites to localstorage
    save.addEventListener("click", () => {
        const blocked = textarea.value.split("\n").map(s => s.trim()).filter(Boolean);
        chrome.storage.local.set({ blocked });
    });

    //if a button is selected, save selection in storage
    radioButtons.addEventListener('click', e =>{
        if(e.target && e.target.matches("input[type='radio']")){
            timer.choiceid = e.target.getAttribute("id");
            if(!(timer.choiceid.includes("opt"))){
                var studyMin = document.getElementById("studyMin").value;
                var shortBkMin = document.getElementById("shortBkMin").value;
                var cycleNum = document.getElementById("cycleNum").value;
                var longBkMin = document.getElementById("longBkMin").value;
                //check if any inputs
                if(studyMin != ""){
                    timer.studyMin = studyMin;
                }if(shortBkMin != ""){
                    timer.shortBkMin = shortBkMin;
                }if(cycleNum != ""){
                    timer.cycleNum = cycleNum;
                }if(longBkMin != ""){
                    timer.longBkMin = longBkMin;
                }
            }
            saveToStorage(timer);
        }
    });

    //if a cust value is input, save input in storage
    custSessionInputs.addEventListener('input', e =>{
        if(e.target && e.target.matches("input[type='number']")){
            var studyMin = document.getElementById("studyMin").value;
            var shortBkMin = document.getElementById("shortBkMin").value;
            var cycleNum = document.getElementById("cycleNum").value;
            var longBkMin = document.getElementById("longBkMin").value;
            //check if any inputs
            if(studyMin != ""){
                timer.studyMin = studyMin;
            }if(shortBkMin != ""){
                timer.shortBkMin = shortBkMin;
            }if(cycleNum != ""){
                timer.cycleNum = cycleNum;
            }if(longBkMin != ""){
                timer.longBkMin = longBkMin;
            }
            saveToStorage(timer);
        }
    });

    //Begin session by getting timer informaiton
    beginButton.addEventListener('click', () => {
        validateTimerChoice();
    });
    
    //End session //end session button not working
    endButton.addEventListener('click', () => {
        var PgTitle = document.getElementById("PgTitle");
        PgTitle.innerHTML = "Main Menu";
        const enabled = false;
        chrome.storage.local.set({ enabled });
        timerDiv.style.display = "block";
        beginButton.style.display = "inline";
        pauseBtn.style.display = "none";
        nextStep.style.display = "none";
        endButton.style.display = "none";
        timer.state = "mainpg";
        
        timer.inStudySession = false;
        timer.endTime = "";
        saveToStorage(timer);
        if(timer.state == "study"){
            answer = confirm("Reload page for timer to stop?");
            if(answer){
                chrome.tabs.reload();
            }
        }
                
    });

    //Show / hide whitelisting options 
    optionsBtn.addEventListener('click', () => {
        if(optionsBtn.innerHTML == "Whitelist Options"){
            //show the options
            var options = document.getElementById("options");
            options.style.display = "block";
            //change options button to hide options
            optionsBtn.innerHTML = "Hide Options";
            //get the list of sites
            chrome.storage.local.get(["blocked"], function (local) {
                console.log("getting sites");
                const blocked = local;
                if (Array.isArray(blocked.blocked)) {
                    textarea.value = blocked.blocked.join("\n");
                }
            });
        }else{
            //hide the options
            var options = document.getElementById("options");
            options.style.display = "none";
            //change hide options button to options
            optionsBtn.innerHTML = "Whitelist Options";
        }
    });

    //populate recomanded webistes 
    popWebsites.addEventListener('click', () => {
        //load the text area with our list of approved websites
        textarea.value = "blackboard.missouristate.edu \nclassroom.google.com  \nwww.office.com  \ndrive.google.com \nowl.purdue.edu";
        save.click();
    });

    pauseBtn.addEventListener('click', ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "pause"}, function(response) {
              console.log(response.farewell);
            });
        });
    });

    // nextStep.addEventListener('click', ()=>{
    //     console.log("clicked nextstep");
    //     //figure out if the next step is to study or break
    //     if(numStudy == Cnum && numBreak == Cnum){
    //         //long break time
    //         //TODO
    //     }
    //     else if(numStudy > numBreak){
    //         //short break
    //         //TODO
    //     }else if(numStudy == numBreak){
    //         //study time
    //         startTimer(Stime);
    //     }
    // });
});

//Begin Session Functions
function validateTimerChoice(){
    //Get which timer choice is selected
    var timerOp = document.querySelector('input[name="timerOp"]:checked');
    //Figure out if none, custom, or standard
    if(!timerOp){ //if no choice selected
        alert("Please select a timer type to begin");
    }else if (!timerOp.getAttribute("id").includes("opt")){
        validateCustomTimer();
    }else{
        //Extract information from choice
        var timerInfoArray = timerOp.value.split("/");
        var studyMin = timerInfoArray[0]; 
        var shortBkMin = timerInfoArray[1];
        var cycleNum = timerInfoArray[2];
        var longBkMin = timerInfoArray[3];
        timer.studyMin = studyMin;
        timer.shortBkMin = shortBkMin;
        timer.cycleNum = cycleNum;
        timer.longBkMin = longBkMin;
        saveToStorage(timer);
        startTimer(studyMin);
        
    }
}

function validateCustomTimer(){
    var studyMin = document.getElementById("studyMin").value;
    var shortBkMin = document.getElementById("shortBkMin").value;
    var cycleNum = document.getElementById("cycleNum").value;
    var longBkMin = document.getElementById("longBkMin").value;
    //check if all the inputs have been filled
    if(studyMin == ""){
        alert("Please fill all customer time fields to begin");
    }else if(shortBkMin == ""){
        alert("Please fill all customer time fields to begin");
    }else if(cycleNum == ""){
        alert("Please fill all customer time fields to begin");
    }else if(longBkMin == ""){
        alert("Please fill all customer time fields to begin");
    }else{
        timer.studyMin = studyMin;
        timer.shortBkMin = shortBkMin;
        timer.cycleNum = cycleNum;
        timer.longBkMin = longBkMin;
        saveToStorage(timer);
        startTimer(studyMin);
    }
}

function startTimer(minutes){
    confirm("Ready to reload page for timer to begin?");
    //display study mode
    // var studyH3 = document.createElement("h3");
    // studyH3.innerHTML = "Study Mode";
    // var popCont = document.getElementById("popupContainer");
    // popCont.prepend(studyH3);

    //save state to storage
    timer.state = "study";
    //begin blocking websites in the list
    const enabled = true;
    chrome.storage.local.set({ enabled });

    //Remove timer options and begin session button, add end session button
    timerDiv.style.display = "none";
    beginButton.style.display = "none";
    endButton.style.display = "inline";
    pauseBtn.style.display = "inline";
    // var timerInfo = "/" + studyMin + "/" + shortBkMin + "/" + cycleNum + "/" + longBkMin;

    //calculate the end time
    timeMessage = calcEndTime(minutes);

    //Store endTime and inSession
    timer.inStudySession = true;
    timer.endTime = timeMessage;
    //Store updated timer information
    saveToStorage(timer);
    chrome.tabs.reload();
}
function calcEndTime(mins){
    //returns a string represenation of the time to send as a message
    var countDownTime = new Date().getTime();
    endTimeDate = new Date(countDownTime + mins*60000);
    var endTimeString = endTimeDate.getHours() + " " + endTimeDate.getMinutes() + " " + endTimeDate.getSeconds();
    return endTimeString;
}

function saveToStorage(obj){
    let serialized = JSON.stringify(obj);
    chrome.storage.sync.set({"popupState": serialized}, function() {
        console.log('Value is set to ' + serialized);
    });
}