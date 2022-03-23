//global object for storing ifnormation about the timer
var timer = {};

//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    //Variables 
    var websiteBtn = document.getElementById("websiteBtn");
    var timerDiv = document.getElementById("timerOptions");
    var textarea = document.getElementById("textarea");
    var save = document.getElementById("save");
    var checkbox = document.getElementById("checkbox");
    var radioButtons = document.getElementById("radioButtons");
    var custSessionInputs = document.getElementById("custSessionInputs");
    var beginButton = document.getElementById("beginSession");
    var endButton = document.getElementById("endSession");
    var optionsBtn = document.getElementById("optionsBtn");
    var popWebsites = document.getElementById("popWebsites");

    //Website    
    websiteBtn.addEventListener("click", () =>{
        chrome.tabs.create({url: chrome.runtime.getURL("home-site.html") });
    });
    
    //Load previous session data if any
    if(localStorage){
        var popupStateJSON = localStorage.getItem('popupState');
        if(!(popupStateJSON === "undefined" || popupStateJSON === null || popupStateJSON.length === 0)){
            //if there is data load it in, get it as a string
            var popupState = JSON.parse(popupStateJSON);
            //Radio button selection
            if(popupState){
                if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state == "study"){
                    //hide timer options
                    var timerDiv = document.getElementById("timerOptions");
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline";
                }
                if(!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state == "mainpg"){
                    //show timer options
                    var timerDiv = document.getElementById("timerOptions");
                    timerDiv.style.display = "block";
                    beginButton.style.display = "inline";
                }
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
    }

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
    
    //if a button is selected, save selection in local storage
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
            }else{
                //if it is opt, get rid of other properties
                delete timer.studyMin;
                delete timer.shortBkMin;
                delete timer.cycleNum;
                delete timer.longBkMin;
            }
            let serializedTimer = JSON.stringify(timer);
            if(localStorage){
                localStorage.setItem("popupState", serializedTimer)
            }
        }
    });

    //if a cust value is input, save input in local storage
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
            if(localStorage){
                localStorage.setItem("popupState", serializedTimer)
            }
        }
    });

    //Begin session by getting timer informaiton
    beginButton.addEventListener('click', () => {
        //Get timer selection information
        var timerOp = document.querySelector('input[name="timerOp"]:checked');
        //Validate choice
        if(!timerOp){ //if no item was found
            alert("Please select a timer type to begin");
        }else if (!timerOp.getAttribute("id").includes("opt")){
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
                //save state to local storage
                timer.state = "study";
                let serializedTimer = JSON.stringify(timer);
                if(localStorage){
                    localStorage.setItem("popupState", serializedTimer)
                }
                //begin blocking websites in the list
                if(!checkbox.checked){
                    checkbox.click();
                }
                //Remove timer options and begin session button, add end session button
                timerDiv.style.display = "none";
                beginButton.style.display = "none";
                endButton.style.display = "inline";
                //call timer function
                // var timerInfo = "/" + studyMin + "/" + shortBkMin + "/" + cycleNum + "/" + longBkMin;
                //send timer end time to content js
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {timerMessage: "EndTime", mins: studyMin}, function(response) {
                    });
                });
            }
        }else{
            //save state to local storage
            timer.state = "study";
            let serializedTimer = JSON.stringify(timer);
            if(localStorage){
                localStorage.setItem("popupState", serializedTimer)
            }
            //begin blocking websites in the list
            if(!checkbox.checked){
                checkbox.click();
            }
            //Remove timer options and begin session button, add end session button
            timerDiv.style.display = "none";
            beginButton.style.display = "none";
            // endButton.style.display = "inline";

            //Store timer done time to be accessed by background script to run the same timer across all tabs
            var timerInfoArray = timerOp.value.split("/");
            var studyMin = timerInfoArray[0];
            // var shortBkMin = timerInfoArray[1];
            // var cycleNum = timerInfoArray[2];
            // var longBkMin = timerInfoArray[3];
            
            //send timer end time to content js
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {timerMessage: "EndTime", mins: studyMin}, function(response) {
                });
            });
        }
    });
    
    //End session //end session button not working
    endButton.addEventListener('click', () => {
        if(checkbox.checked){
            checkbox.click();
        }
        //load state into LS
        timer.state = "mainpg";
        let serializedTimer = JSON.stringify(timer);
        if(localStorage){
            localStorage.setItem("popupState", serializedTimer);
        }
        timerDiv.style.display = "block";
        beginButton.style.display = "inline";
        
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

});

//NOT WORKING 
//listen for timer to end
var endButton = document.getElementById("endSession");
var checkbox = document.getElementById("checkbox");
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.timerMessage === "TimerEnd"){
            // endButton.click();
            if(checkbox.checked){
                checkbox.click();
            }
            //load state into LS
            timer.state = "mainpg";
            let serializedTimer = JSON.stringify(timer);
            if(localStorage){
                localStorage.setItem("popupState", serializedTimer);
            }
        }
    }
);

