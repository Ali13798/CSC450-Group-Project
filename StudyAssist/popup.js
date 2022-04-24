var timer = {}; //global object for storing information about the timer
var timeMessage; //Stores the string rep of the end timer time
//Session progress counters
// var numStudy, numBreak, numLongBreak;
//Timer choice values
// var Stime, Btime, LBtime, Cnum;
var innerCycleNum = 2;
//Content areas
var popCont, timerDiv, custSessionInputs, textarea, messages;
//Buttons
var websiteBtn, save, radioButtons, beginButton, endButton, optionsBtn, popWebsites, pauseBtn, nextStep;

//Get User information

//Button for user to enter name
var buttonInfo;
window.addEventListener("DOMContentLoaded", () => {
    buttonInfo = document.getElementById("buttonInfo");
    buttonInfo.addEventListener("click", submitForm);
    function submitForm() {
        let data = {};
        data.fname = document.getElementById("fname").value;
        data.lname = document.getElementById("lname").value;
        if (document.getElementById("fname").value == "") {
            alert("Please, enter your first name.")
        } else if (document.getElementById("lname").value == "") {
            alert("Please, enter your last name.")
        }
        else {
            alert("Hello, " + fname.value + " " + lname.value);
        }
    }
})



//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", () => {
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
    messages = document.getElementById("messages");
    //Website    
    websiteBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("home-site.html") });
    });

    //if the title is welcome, then clear some info from storage
    if (PgTitle.innerHTML == "Welcome!") {
        //TODO: decide what to remove or change

        //for now, just make sure blocking is off
        const enabled = false;
        chrome.storage.local.set({ enabled });
    }

    //Load previous session data if any
    chrome.storage.sync.get(['popupState'], function (result) {
        if (!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)) {
            //if there is data load it in, get it as a string
            var popupState = JSON.parse(result.popupState);
            timer = popupState;
            if (popupState) {
                //load vars keeping track of num of study and breaks
                timer.numStudy = (popupState.numStudy) ? parseInt(popupState.numStudy) : 0;
                timer.numBreak = (popupState.numBreak) ? parseInt(popupState.numBreak) : 0;
                timer.numLongBreak = (popupState.numLongBreak) ? parseInt(popupState.numLongBreak) : 0;
                timer.Stime = parseFloat(popupState.studyMin);
                timer.Btime = parseFloat(popupState.shortBkMin);
                timer.LBtime = parseFloat(popupState.longBkMin);
                timer.Cnum = parseInt(popupState.cycleNum);
                //Debug: // console.log("counters(s,b,lb): " + numStudy + " " + numBreak + " " + numLongBreak);
                //detect if the session has finished
                if (timer.numLongBreak == timer.Cnum) {
                    //set back to main page and display session finished
                    popupState.state = "mainpg";
                    timer.state = "mainpg";
                    messages.innerHTML = "Session Completed!";
                    messages.style.display = "block";
                    //reset counters
                    timer.numStudy = 0;
                    timer.numBreak = 0;
                    timer.numLongBreak = 0;
                } else if (popupState.state === "mainpg") {
                    messages.innerHTML = "";
                    messages.style.display = "block";
                } else if (((popupState.state === "study") || (popupState.state === "intermission")) || ((popupState.state === "break") || (popupState.state === "Long break"))) {
                    //display how many of each have been completed
                    var progressMessage = "Study: " + timer.numStudy + "/" + innerCycleNum
                        + ", Short Break: " + timer.numBreak + "/" + innerCycleNum
                        + ", Long Break: " + timer.numLongBreak + "/" + timer.Cnum;
                    messages.innerHTML = progressMessage;
                    messages.style.display = "block";
                }

                //Check if in study state
                if (!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "study") {
                    //display it is in study mode
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Study Mode";
                    //hide timer options
                    const enabled = true;
                    chrome.storage.local.set({ enabled });
                    console.log("in study state");
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline-block";
                    pauseBtn.style.display = "inline-block";
                    nextStep.style.display = "none";
                }
                //check if in intermission state
                if (!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "intermission") {
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Intermission";
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline-block";
                    pauseBtn.style.display = "none";
                    //figure out what is next
                    var nextStepMessage;
                    if (timer.numStudy == innerCycleNum && timer.numBreak == innerCycleNum) {
                        //long break time
                        nextStepMessage = "Start Long Break";
                    } else if (timer.numStudy > timer.numBreak) {
                        //short break
                        nextStepMessage = "Start Short Break";
                    } else if (timer.numStudy == timer.numBreak) {
                        //study time
                        nextStepMessage = "Start Study Time";
                    }
                    nextStep.style.display = "inline";
                    nextStep.innerHTML = nextStepMessage;
                }
                //check if in break state
                if (!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "break") {
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Short Break";
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline-block";
                    pauseBtn.style.display = "inline-block";
                }
                //check if in long break state
                if (!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "Long break") {
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Long Break";
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "none";
                    beginButton.style.display = "none";
                    endButton.style.display = "inline-block";
                    pauseBtn.style.display = "inline-block";
                }
                //check if in main page menu state
                if (!(popupState.state === undefined || popupState.state === null || popupState.state.length === 0) && popupState.state === "mainpg") {
                    var PgTitle = document.getElementById("PgTitle");
                    PgTitle.innerHTML = "Main Menu";
                    const enabled = false;
                    chrome.storage.local.set({ enabled });
                    timerDiv.style.display = "block";
                    beginButton.style.display = "inline-block";
                    pauseBtn.style.display = "none";
                    nextStep.style.display = "none";
                    endButton.style.display = "none";
                }

                if (!(popupState.newBlockedPg === undefined || popupState.newBlockedPg === null || popupState.newBlockedPg.length === 0)) {
                    if (popupState.newBlockedPg == true) {
                        var url = popupState.lastBlockedPage;
                        //get the domain from the url
                        var domain = (new URL(url)).hostname;
                        message = "Access to the following page is not permitted during study mode:\n" + url
                            + "\nAllow this domain? " + domain;
                        popupState.newBlockedPg = false;
                        timer.newBlockedPg = false;
                        popupState.lastBlockedPage = "";
                        timer.lastBlockedPage = "";
                        saveToStorage(timer);
                        answer = confirm(message);
                        if (answer) {
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
                if (!(popupState.choiceid === undefined || popupState.choiceid === null || popupState.choiceid.length === 0)) {
                    //choice is the id of the element to set to be checked
                    document.getElementById(popupState.choiceid).checked = true;
                }
                if (!(popupState.studyMinCust === undefined || popupState.studyMinCust === null || popupState.studyMinCust.length === 0)) {
                    document.getElementById("studyMin").value = popupState.studyMinCust;
                }
                if (!(popupState.shortBkMinCust === undefined || popupState.shortBkMinCust === null || popupState.shortBkMinCust.length === 0)) {
                    document.getElementById("shortBkMin").value = popupState.shortBkMinCust;
                }
                if (!(popupState.cycleNumCust === undefined || popupState.cycleNumCust === null || popupState.cycleNumCust.length === 0)) {
                    document.getElementById("cycleNum").value = popupState.cycleNumCust;
                }
                if (!(popupState.longBkMinCust === undefined || popupState.longBkMinCust === null || popupState.longBkMinCust.length === 0)) {
                    document.getElementById("longBkMin").value = popupState.longBkMinCust;
                }

            }

        }
    });
    //saves the list of blocked sites to localstorage
    save.addEventListener("click", () => {
        var domains = textarea.value.split("\n").map(s => s.trim()).filter(Boolean);
        //check that each is a valid address
        var blocked = [];
        regex = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,256}\b(\.[a-z, A-Z]*)/;
        var removedString = "The following domains are invalid and have been removed: <br>";
        for (var i = 0; i < domains.length; i++) {

            if (domains[i].match(regex)) {
                blocked.push(domains[i]);
                console.log("valid: " + blocked);
            } else {
                removedString += domains[i] + "<br>";
                console.log("removedString: " + removedString);
            }
        }
        //update list with only approved
        textarea.value = blocked.join("\n");
        //tell user which were removed
        var removedPara = document.getElementById("removedDomains");
        removedPara.innerHTML = removedString;
        // console.log(blocked);
        chrome.storage.local.set({ blocked });
    });

    //if a button is selected, save selection in storage
    radioButtons.addEventListener('click', e => {
        if (e.target && e.target.matches("input[type='radio']")) {
            timer.choiceid = e.target.getAttribute("id");
            if (!(timer.choiceid.includes("opt"))) {
                var studyMin = document.getElementById("studyMin").value;
                var shortBkMin = document.getElementById("shortBkMin").value;
                var cycleNum = document.getElementById("cycleNum").value;
                var longBkMin = document.getElementById("longBkMin").value;
                //check if any inputs
                if (studyMin != "") {
                    timer.studyMin = studyMin;
                } if (shortBkMin != "") {
                    timer.shortBkMin = shortBkMin;
                } if (cycleNum != "") {
                    timer.cycleNum = cycleNum;
                } if (longBkMin != "") {
                    timer.longBkMin = longBkMin;
                }
            }
            saveToStorage(timer);
        }
    });

    //if a cust value is input, save input in storage
    custSessionInputs.addEventListener('input', e => {
        //set separate values for keeping the custom timer for later use
        if (e.target && e.target.matches("input[type='number']")) {
            var studyMinCust = document.getElementById("studyMin").value;
            var shortBkMinCust = document.getElementById("shortBkMin").value;
            var cycleNumCust = document.getElementById("cycleNum").value;
            var longBkMinCust = document.getElementById("longBkMin").value;
            //check if any inputs
            if (studyMinCust != "") {
                timer.studyMinCust = studyMinCust;
            } if (shortBkMinCust != "") {
                timer.shortBkMinCust = shortBkMinCust;
            } if (cycleNumCust != "") {
                timer.cycleNumCust = cycleNumCust;
            } if (longBkMinCust != "") {
                timer.longBkMinCust = longBkMinCust;
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
        //set up the Main Menu
        var PgTitle = document.getElementById("PgTitle");
        PgTitle.innerHTML = "Main Menu";
        timerDiv.style.display = "block";
        beginButton.style.display = "inline-block";
        pauseBtn.style.display = "none";
        nextStep.style.display = "none";
        endButton.style.display = "none";
        timer.state = "mainpg";
        messages.innerHTML = "";
        //reset count of study and short breaks
        timer.numStudy = 0;
        timer.numBreak = 0;
        timer.numLongBreak = 0;
        // timer.inStudySession = false;
        timer.endTime = "";
        saveToStorage(timer);
        //stop blocking
        const enabled = false;
        chrome.storage.local.set({ enabled });
        if (timer.state == "study") {
            answer = confirm("Reload page for timer to stop?");
            if (answer) {
                chrome.tabs.reload();
            }
        }

    });

    //Show / hide whitelisting options 
    optionsBtn.addEventListener('click', () => {
        if (optionsBtn.innerHTML == "Whitelist Options") {
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
        } else {
            //clear removed message
            var removedPara = document.getElementById("removedDomains");
            removedPara.innerHTML = "";
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

    pauseBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { message: "pause" }, function (response) {
                console.log(response.farewell);
            });
        });
    });

    nextStep.addEventListener('click', () => {
        //figure out if the next step is to study or break
        if (timer.numStudy == innerCycleNum && timer.numBreak == innerCycleNum) {
            //long break time
            //display study mode
            PgTitle.innerHTML = "Long Break";
            //save state to storage
            timer.state = "Long break";
            //begin blocking websites in the list
            const enabled = false;
            chrome.storage.local.set({ enabled });
            //reset count of study and short breaks
            timer.numStudy = 0;
            timer.numBreak = 0;
            saveToStorage(timer);
            startTimer(timer.LBtime);
        }
        else if (timer.numStudy > timer.numBreak) {
            //short break
            //display study mode
            PgTitle.innerHTML = "Short Break";
            //save state to storage
            timer.state = "break";
            //begin blocking websites in the list
            const enabled = false;
            chrome.storage.local.set({ enabled });
            startTimer(timer.Btime);
        } else if (timer.numStudy == timer.numBreak) {
            //study time
            //display study mode
            PgTitle.innerHTML = "Study Mode";
            //save state to storage
            timer.state = "study";
            //begin blocking websites in the list
            const enabled = true;
            chrome.storage.local.set({ enabled });
            startTimer(timer.Stime);
        }
    });
});

//Begin Session Functions
function validateTimerChoice() {
    //Get which timer choice is selected
    var timerOp = document.querySelector('input[name="timerOp"]:checked');
    //Figure out if none, custom, or standard
    if (!timerOp) { //if no choice selected
        alert("Please select a timer type to begin");
    } else if (!timerOp.getAttribute("id").includes("opt")) {
        validateCustomTimer();
    } else {
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
        //display study mode
        PgTitle.innerHTML = "Study Mode";
        //save state to storage
        timer.state = "study";
        saveToStorage(timer);
        //begin blocking websites in the list
        const enabled = true;
        chrome.storage.local.set({ enabled });
        startTimer(studyMin);
    }
}

function validateCustomTimer() {
    var studyMin = document.getElementById("studyMin").value;
    var shortBkMin = document.getElementById("shortBkMin").value;
    var cycleNum = document.getElementById("cycleNum").value;
    var longBkMin = document.getElementById("longBkMin").value;
    //check if all the inputs have been filled
    if (studyMin == "") {
        alert("Please fill all customer time fields to begin");
    } else if (shortBkMin == "") {
        alert("Please fill all customer time fields to begin");
    } else if (cycleNum == "") {
        alert("Please fill all customer time fields to begin");
    } else if (longBkMin == "") {
        alert("Please fill all customer time fields to begin");
    } else {
        timer.studyMin = studyMin;
        timer.shortBkMin = shortBkMin;
        timer.cycleNum = cycleNum;
        timer.longBkMin = longBkMin;

        //display study mode
        PgTitle.innerHTML = "Study Mode";
        //save state to storage
        timer.state = "study";
        saveToStorage(timer);
        //begin blocking websites in the list
        const enabled = true;
        chrome.storage.local.set({ enabled });
        startTimer(studyMin);
    }
}

function startTimer(minutes) {
    var answer = confirm("Ready to reload page for timer to begin? Press cancel to ask again in 30 seconds.");
    while (!answer) { //TODO: come back to this, not a good way because it probably wont work when the popup is opened again. try adding a prompt when it loads
        //wait 30 seconds and ask again
        var intervalID = setInterval(function () {
            answer = confirm("Ready to reload page for timer to begin? Press cancel to ask again in 30 seconds.");
        }, 30 * 1000);
    }
    //Remove timer options and begin session button, add end session button
    timerDiv.style.display = "none";
    beginButton.style.display = "none";
    endButton.style.display = "inline-block";
    pauseBtn.style.display = "inline-block";

    //calculate the end time
    calcEndTime(minutes);

    //reload to start timer on the tab
    chrome.tabs.reload();
}
function calcEndTime(mins) {
    //returns a string represenation of the time to send as a message
    var countDownTime = new Date().getTime();
    endTimeDate = new Date(countDownTime + mins * 60000);
    var endTimeString = endTimeDate.getHours() + " " + endTimeDate.getMinutes() + " " + endTimeDate.getSeconds();
    timer.endTime = endTimeString;
    saveToStorage(timer);
}

function saveToStorage(obj) {
    let serialized = JSON.stringify(obj);
    chrome.storage.sync.set({ "popupState": serialized }, function () {
        console.log('Value is set to ' + serialized);
    });
}