// async function getCurrentTab() {
//     let queryOptions = { active: true, currentWindow: true };
//     let tab = await chrome.tabs.query(queryOptions);
//     return tab;
// }

//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    //Website
    var websiteBtn = document.getElementById("websiteBtn");
    websiteBtn.addEventListener("click", () =>{
        chrome.tabs.create({url: chrome.runtime.getURL("testWebPage.html") });
    });

    //Load previous session data if any
    if(localStorage){
        var popupStateJSON = localStorage.getItem('popupState');
        if(!(popupStateJSON === undefined || popupStateJSON === null || popupStateJSON.length === 0)){
            //if there is data load it in, get it as a string
            var popupState = JSON.parse(popupStateJSON);
            //Radio button selection
            if(popupState){
                if(!(popupState.choiceid == undefined)){
                    //choice is the id of the element to set to be checked
                    document.getElementById(popupState.choiceid).checked = true;
                }
                if(!(popupState.studyMin == undefined)){
                    document.getElementById("studyMin").value = popupState.studyMin;
                }
                if(!(popupState.studyMin == undefined)){
                    document.getElementById("shortBkMin").value = popupState.shortBkMin;
                }
                if(!(popupState.studyMin == undefined)){
                    document.getElementById("cycleNum").value = popupState.cycleNum;
                }
                if(!(popupState.studyMin == undefined)){
                    document.getElementById("longBkMin").value = popupState.longBkMin;
                }
            }
            //Next: save/load the state of being in study mode
           
        }        
    }

    //Whitelisting 
    var textarea = document.getElementById("textarea");
    var save = document.getElementById("save");
    var checkbox = document.getElementById("checkbox");
    //load the text area with our list of approved websites
    textarea.innerHTML = "blackboard.missouristate.edu \nclassroom.google.com  \nwww.office.com  \ndrive.google.com \nowl.purdue.edu";
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
    var radioButtons = document.getElementById("radioButtons");
    radioButtons.addEventListener('click', e =>{
        if(e.target && e.target.matches("input[type='radio']")){
            var timer = {};
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
            if(localStorage){
                localStorage.setItem("popupState", serializedTimer)
            }
        }
    });

    //if a cust value is input, save input in local storage
    var custSessionInputs = document.getElementById("custSessionInputs");
    custSessionInputs.addEventListener('input', e =>{
        if(e.target && e.target.matches("input[type='number']")){
            var timer = {};
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
    var beginButton = document.getElementById("beginSession");
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
                //begin blocking websites in the list
                if(!checkbox.checked){
                    checkbox.click();
                }
                //Remove timer options and begin session button, add end session button
                var timerDiv = document.getElementById("timerOptions");
                timerDiv.style.display = "none";
                beginButton.style.display = "none";
                endButton.style.display = "inline";
                //call timer function
                var timerInfo = "/" + studyMin + "/" + shortBkMin + "/" + cycleNum + "/" + longBkMin;
                // chrome.runtime.sendMessage({message: "Timer:/" + timerInfo}, function(response) {
                //     console.log(response.farewell);
                // });
            }
        }else{
            //begin blocking websites in the list
            if(!checkbox.checked){
                checkbox.click();
            }
            //Remove timer options and begin session button, add end session button
            var timerDiv = document.getElementById("timerOptions");
            timerDiv.style.display = "none";
            beginButton.style.display = "none";
            // endButton.style.display = "inline";
            //Call timer function
            // let queryOptions = { active: true, currentWindow:true};
            // let tabs = await chrome.tabs.query(queryOptions);
            // chrome.tabs.sendMessage(tabs[0].id, {message: "Timer:/" + timerOp.value}, function(response) {
            //     console.log(response.status);
            // });
            // let tab = getCurrentTab();
            // chrome.tabs.sendMessage(tab[0].id, {message: "Timer:/" + timerOp.value}, function(response) {
            //     console.log(response.status);
            // });
            
        }
    });
    
    //End session
    var endButton = document.getElementById("endSession");
    endButton.addEventListener('click', () => {
        if(checkbox.checked){
            checkbox.click();
        }
        var timerDiv = document.getElementById("timerOptions");
        timerDiv.style.display = "block";
        beginButton.style.display = "inline";
        // endButton.style.display = "none";
    });

    //Show / hide wWhitelisting options 
    var optionsBtn = document.getElementById("optionsBtn");
    optionsBtn.addEventListener('click', () => {
        console.log("optionsBtn clicked");
        if(optionsBtn.innerHTML == "Options"){
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

});

