var timer = {}; //global object for storing ifnormation about the timer
var timeMessage;
//HTML element variables
var websiteBtn;
var timerDiv;
var textarea;
var save;
var checkbox;
var radioButtons;
var custSessionInputs;
var beginButton;
var endButton;
var optionsBtn;
var popWebsites;
var pauseBtn;

//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    //Variables 
    websiteBtn = document.getElementById("websiteBtn");
    timerDiv = document.getElementById("timerOptions");
    textarea = document.getElementById("textarea");
    save = document.getElementById("save");
    checkbox = document.getElementById("checkbox");
    radioButtons = document.getElementById("radioButtons");
    custSessionInputs = document.getElementById("custSessionInputs");
    beginButton = document.getElementById("beginSession");
    endButton = document.getElementById("endSession");
    optionsBtn = document.getElementById("optionsBtn");
    popWebsites = document.getElementById("popWebsites");
    pauseBtn = document.getElementById("pauseBtn");

    //Website    
    websiteBtn.addEventListener("click", () =>{
        chrome.tabs.create({url: chrome.runtime.getURL("home-site.html") });
    });
    
    //Load previous session data if any
        chrome.storage.sync.get(['popupState'], function(result) {
            if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
                //if there is data load it in, get it as a string
                var popupState = JSON.parse(result.popupState);
                //Radio button selection
                if(popupState){
                    //Check if in study state
                    if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state == "study"){
                        //hide timer options
                        var timerDiv = document.getElementById("timerOptions");
                        timerDiv.style.display = "none";
                        beginButton.style.display = "none";
                        endButton.style.display = "inline";
                        pauseBtn.style.display = "inline";
                    }
                    //check if in main page menu state
                    if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state == "mainpg"){
                        //if checked, uncheck bc session over
                        if(checkbox.checked){
                            const enabled = false;
                            chrome.storage.local.set({ enabled });
                            checkbox.click();
                        }
                        var timerDiv = document.getElementById("timerOptions");
                        timerDiv.style.display = "block";
                        beginButton.style.display = "inline";
                        pauseBtn.style.display = "none";
                    }

                    //Populate choices for customer timer
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

    //Whitelisting 
    //saves the list of blocked sites to localstorage
    save.addEventListener("click", () => {
        const blocked = textarea.value.split("\n").map(s => s.trim()).filter(Boolean);
        chrome.storage.local.set({ blocked });
    });
    //sets the user's choice of blocking to be enabled
    checkbox.addEventListener("change", (event) => {
        const enabled = event.target.checked;
        chrome.storage.local.set({ enabled });
    });
    //get the list of sites and the user's choice of enabled from local storage
    chrome.storage.local.get(["blocked", "enabled"], function (local) {
        const { blocked, enabled } = local;
        if (Array.isArray(blocked)) {
        textarea.value = blocked.join("\n");
        checkbox.checked = enabled;
        }
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
            let serializedTimer = JSON.stringify(timer);
            chrome.storage.sync.set({"popupState": serializedTimer}, function() {
                console.log('Value is set to ' + serializedTimer);
            });
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
            let serializedTimer = JSON.stringify(timer);
            chrome.storage.sync.set({"popupState": serializedTimer}, function() {
                console.log('Value is set to ' + serializedTimer);
            });
        }
    });

    //Begin session by getting timer informaiton
    beginButton.addEventListener('click', () => {
        validateTimerChoice();
    });
    
    //End session //end session button not working
    endButton.addEventListener('click', () => {
        if(checkbox.hasAttribute("checked")){
            console.log("in end session checkbox now: " + checkbox.checked)
            const enabled = false;
            chrome.storage.local.set({ enabled });
            checkbox.click();
        }
        //load state into LS
        timer.state = "mainpg";
        timerDiv.style.display = "block";
        beginButton.style.display = "inline";
        timer.inStudySession = false;

        //Store endTime and inSession
        timer.inStudySession = false;
        //Store updated timer information
        let serializedTimer = JSON.stringify(timer);
        chrome.storage.sync.set({"popupState": serializedTimer}, function() {
            console.log('Value is set to ' + serializedTimer);
        });
        
    });// endButton.style.display = "none";

    //Show / hide whitelisting options 
    optionsBtn.addEventListener('click', () => {
        if(optionsBtn.innerHTML == "Whitelist Options"){
            //show the options
            var options = document.getElementById("options");
            options.style.display = "block";
            //change options button to hide options
            optionsBtn.innerHTML = "Hide Options";
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
        startTimer(studyMin);
        //Todo: add choice to storage
        // var shortBkMin = timerInfoArray[1];
        // var cycleNum = timerInfoArray[2];
        // var longBkMin = timerInfoArray[3];
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
        startTimer(studyMin);
    }
}

function startTimer(minutes){
    confirm("Ready to reload page for timer to begin?");
    //save state to storage
    timer.state = "study";
    //begin blocking websites in the list
    if(!checkbox.checked){
        const enabled = true;
        chrome.storage.local.set({ enabled });
        checkbox.click();
    }
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
    let serializedTimer = JSON.stringify(timer);
    chrome.storage.sync.set({"popupState": serializedTimer}, function() {
        console.log('Value is set to ' + serializedTimer);
    });
    chrome.tabs.reload();
}
function calcEndTime(mins){
    //returns a string represenation of the time to send as a message
    var countDownTime = new Date().getTime();
    endTimeDate = new Date(countDownTime + mins*60000);
    var endTimeString = endTimeDate.getHours() + " " + endTimeDate.getMinutes() + " " + endTimeDate.getSeconds();
    return endTimeString;
}