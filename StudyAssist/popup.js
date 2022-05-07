var timer = {}; //global object for storing information about the timer
var timeMessage; //Stores the string rep of the end timer time
var users = {} //Object for storing information of users
var pin = {};

//Content areas
var popCont, timerDiv, custSessionInputs, textarea, messages, healthyMsg, userInfoInput, displayEnterPin;
//Buttons
var infoBtn, save, radioButtons, beginButton, endButton, optionsBtn, popWebsites, pauseBtn, nextStep;
var healthyMessage = "<br><br>Healthy Break Tips: <br>-Drink water <br>-Have some fruit as a snack <br>-Get up and stretch <br>-Some light exercise";

//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", () => {
    //Variable
    popCont = document.getElementById("popupContainer");
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
    healthyMsg = document.getElementById("healthy");
    userInfoInput = document.getElementById("userInfoInput");
    infoBtn = document.getElementById("buttonInfo");
    parentBtn = document.getElementById("parentModeBtn");
    validationP = document.getElementById("validation");

    //Get User information
    //Button for user to enter name
    infoBtn.addEventListener("click", submitForm);
    function submitForm() {
        let users = {};
        users.fusername = document.getElementById("fname").value;
        users.lusername = document.getElementById("lname").value;
        if (document.getElementById("fname").value == "") {
            alert("Please, enter your first name.")
        } else if (document.getElementById("lname").value == "") {
            alert("Please, enter your last name.")
        }
        else {
            alert("Hello, " + fname.value + " " + lname.value);
            saveToStorage(users)
        }

    }

    //Parent Mode Button
    parentBtn.addEventListener("click", togglePinField);
    parentInput = document.getElementById("parentInput");
    form = document.querySelector('parentInputForm');
    function togglePinField() {
        if (parentInput.style.display === "none") {
            parentInput.style.display = "block";
        } else {
            parentInput.style.display = "none";
        }
    }
    validationP.addEventListener("click", authorizationPin)
    function authorizationPin() {
        let pin = {};
        pin.parentInputP1 = document.getElementById("parentInputP1").value;
        pin.parentInputP2 = document.getElementById("parentInputP2").value;
        pin.parentInputP3 = document.getElementById("parentInputP3").value;
        pin.parentInputP4 = document.getElementById("parentInputP4").value;
        if (document.getElementById("parentInputP1").value == "") {
            alert("Missing number.")
        } else if (document.getElementById("parentInputP2").value == "") {
            alert("Missing number.")
        } else if (document.getElementById("parentInputP3").value == "") {
            alert("Missing number.")
        } else if (document.getElementById("parentInputP4").value == "") {
            alert("Missing number.")
        } else {
            alert("Pin saved in Local Storage.")
            saveToStorage(pin)
        }
    }

    //Load previous session data if any
    chrome.storage.sync.get(['popupData'], function (result) {
        if (!(result.popupData === undefined || result.popupData === null || result.popupData.length === 0)) {
            //if there is data load it in, get it as a string
            var popupData = JSON.parse(result.popupData);
            timer = popupData;
            if (popupData) {
                //load vars keeping track of num of study and breaks
                timer.numStudy = (popupData.numStudy) ? parseInt(popupData.numStudy) : 0;
                timer.numBreak = (popupData.numBreak) ? parseInt(popupData.numBreak) : 0;
                timer.numLongBreak = (popupData.numLongBreak) ? parseInt(popupData.numLongBreak) : 0;
                timer.Stime = parseFloat(popupData.studyMin);
                timer.Btime = parseFloat(popupData.shortBkMin);
                timer.LBtime = parseFloat(popupData.longBkMin);
                timer.cycleNum = parseInt(popupData.cycleNum);
                timer.repeatNum = parseInt(popupData.repeatNum);

                if (!(popupData.state === undefined || popupData.state === null || popupData.state.length === 0)) {

                    //detect if the session has finished
                    if (timer.numLongBreak == timer.repeatNum) {
                        //set back to main page and display session finished
                        popupData.state = "mainpg";
                        timer.state = "mainpg";
                        mainPageSettings();
                        messages.innerHTML = "Session Completed!";
                        messages.style.display = "block";

                        //reset counters
                        timer.numStudy = 0;
                        timer.numBreak = 0;
                        timer.numLongBreak = 0;

                        //If there is contents in timeStudied, then save it to the DB
                        if (!(popupData.timeStudied === undefined ||
                            popupData.timeStudied === null ||
                            popupData.timeStudied.length === 0)) {
                            data = {};
                            console.log("data = " + popupData.timeStudied + " " + popupData.clickCount + " " + popupData.keyCount);
                            data.timeStudied = popupData.timeStudied;
                            data.clickCount = popupData.clickCount
                            data.keyCount = popupData.keyCount
                            try {
                                fetch("http://127.0.0.1:5000/saveStudyData", {
                                    method: "POST",
                                    body: JSON.stringify(data),
                                    headers: new Headers({
                                        "content-type": "application/json"
                                    })
                                })
                                    .then(function (response) {
                                        if (response.ok) {
                                            return response.json()
                                        } else {
                                            console.log("Response error status: ", response.status);
                                        }
                                    })
                                    .then(function (message) {
                                        console.log("Message: ", message);
                                        timer.timeStudied = null;
                                        timer.clickCount = null;
                                        timer.keyCount = null;
                                        saveToStorage(timer)
                                    }).catch(function (error) {
                                        console.log("Error on fetch: ", error);
                                    })
                            } catch (error) {
                                console.log("Error on try: ", error);
                            }

                        }

                    } else if (popupData.state === "mainpg") {
                        messages.innerHTML = "";
                        messages.style.display = "none";
                        var PgTitle = document.getElementById("PgTitle");
                        mainPageSettings();

                        //If there is contents in timeStudied, then save it to the DB //Checking here again in case it failed to save when the session ended. 
                        if (!(popupData.timeStudied === undefined ||
                            popupData.timeStudied === null ||
                            popupData.timeStudied.length === 0)) {
                            data = {};
                            console.log("data = " + popupData.timeStudied + " " + popupData.clickCount + " " + popupData.keyCount);
                            data.timeStudied = popupData.timeStudied;
                            data.clickCount = popupData.clickCount
                            data.keyCount = popupData.keyCount
                            try {
                                fetch("http://127.0.0.1:5000/saveStudyData", {
                                    method: "POST",
                                    body: JSON.stringify(data),
                                    headers: new Headers({
                                        "content-type": "application/json"
                                    })
                                })
                                    .then(function (response) {
                                        if (response.ok) {
                                            return response.json()
                                        } else {
                                            console.log("Response error status: ", response.status);
                                        }
                                    })
                                    .then(function (message) {
                                        console.log("Message: ", message);
                                        timer.timeStudied = null;
                                        timer.clickCount = null;
                                        timer.keyCount = null;
                                        saveToStorage(timer)
                                    }).catch(function (error) {
                                        console.log("Error on fetch: ", error);
                                    })
                            } catch (error) {
                                console.log("Error on try: ", error);
                            }

                        }

                    }

                    //Check if in study state
                    if (popupData.state === "study") {
                        studyPageSettings();
                    }

                    //check if in intermission state
                    if (popupData.state === "intermission") {

                        //figure out the next stage is, display it on the button
                        var nextStepMessage;
                        if (timer.numStudy == timer.cycleNum && timer.numBreak == (timer.cycleNum - 1)) {
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

                        interPageSettings(); //set the rest of the settings

                    }

                    //check if in break state
                    if (popupData.state === "break") {
                        var PgTitle = document.getElementById("PgTitle");
                        PgTitle.innerHTML = "Short Break";
                        breakPageSettings();
                    }

                    //check if in long break state
                    if (popupData.state === "Long break") {
                        var PgTitle = document.getElementById("PgTitle");
                        PgTitle.innerHTML = "Long Break";
                        breakPageSettings();
                    }

                }



                if (!(popupData.newBlockedPg === undefined || popupData.newBlockedPg === null || popupData.newBlockedPg.length === 0)) {
                    if (popupData.newBlockedPg == true) {
                        var url = popupData.lastBlockedPage;
                        //get the domain from the url
                        var domain = (new URL(url)).hostname;
                        message = "Access to the following page is not permitted during study mode:\n" + url
                            + "\nAllow this domain? " + domain;
                        // popupData.newBlockedPg = false;
                        timer.newBlockedPg = false;
                        // popupData.lastBlockedPage = "";
                        timer.lastBlockedPage = "";
                        saveToStorage(timer);
                        answer = confirm(message);
                        if (answer) {
                            //get list from storage, add to list, save
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
                if (!(popupData.choiceid === undefined || popupData.choiceid === null || popupData.choiceid.length === 0)) {
                    //choice is the id of the element to set to be checked
                    document.getElementById(popupData.choiceid).checked = true;
                }
                if (!(popupData.studyMinCust === undefined || popupData.studyMinCust === null || popupData.studyMinCust.length === 0)) {
                    document.getElementById("studyMin").value = popupData.studyMinCust;
                }
                if (!(popupData.shortBkMinCust === undefined || popupData.shortBkMinCust === null || popupData.shortBkMinCust.length === 0)) {
                    document.getElementById("shortBkMin").value = popupData.shortBkMinCust;
                }
                if (!(popupData.cycleNumCust === undefined || popupData.cycleNumCust === null || popupData.cycleNumCust.length === 0)) {
                    document.getElementById("cycleNum").value = popupData.cycleNumCust;
                }
                if (!(popupData.longBkMinCust === undefined || popupData.longBkMinCust === null || popupData.longBkMinCust.length === 0)) {
                    document.getElementById("longBkMin").value = popupData.longBkMinCust;
                }
                if (!(popupData.repeatNum === undefined || popupData.repeatNum === null || popupData.repeatNum.length === 0)) {
                    document.getElementById("repeatNum").value = popupData.repeatNum;
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
        var atLeastOneRemoved = false;
        var removedString = "The following domains are invalid and have been removed: <br>";
        for (var i = 0; i < domains.length; i++) {

            if (domains[i].match(regex)) {
                blocked.push(domains[i]);
                console.log("valid: " + blocked);
            } else {
                removedString += domains[i] + "<br>";
                console.log("removedString: " + removedString);
                atLeastOneRemoved = true;
            }
        }
        //update list with only approved
        textarea.value = blocked.join("\n");
        //tell user which were removed
        if (atLeastOneRemoved) {
            var removedPara = document.getElementById("removedDomains");
            removedPara.innerHTML = removedString;
        }

        chrome.storage.local.set({ blocked });
    });

    //if a button is selected, save selection in storage
    radioButtons.addEventListener('click', e => {
        if (e.target && e.target.matches("input[type='radio']")) {
            timer.choiceid = e.target.getAttribute("id");
            if (!(timer.choiceid.includes("opt"))) {
                var studyMinCust = document.getElementById("studyMin").value;
                var shortBkMinCust = document.getElementById("shortBkMin").value;
                var cycleNumCust = document.getElementById("cycleNum").value;
                var longBkMinCust = document.getElementById("longBkMin").value;
                var repeatNum = document.getElementById("repeatNum").value;
                //check if any inputs
                if (studyMinCust != "") {
                    console.log(studyMinCust);
                    if (parseFloat(studyMinCust) <= 0) {
                        console.log(parseFloat(studyMinCust));
                        studyMinCust = 1;
                        alert("Invalid value, only positive numbers. Saved as 1.");
                    }
                    timer.studyMinCust = studyMinCust;


                } if (shortBkMinCust != "") {
                    if (parseFloat(shortBkMinCust) <= 0) {
                        shortBkMinCust = 1;
                        alert("Invalid value, only positive numbers. Saved as 1.");
                    }
                    timer.shortBkMinCust = shortBkMinCust;


                } if (cycleNumCust != "") {
                    if (!Number.isInteger(parseFloat(cycleNumCust))) {
                        cycleNumCust = 1;
                        alert("Invalid value, only whole numbers. Saved as 1.");
                    }
                    timer.cycleNumCust = parseInt(cycleNumCust);

                } if (longBkMinCust != "") {
                    if (parseFloat(longBkMinCust) <= 0) {
                        longBkMinCust = 1;
                        alert("Invalid value, only positive numbers. Saved as 1.");
                    }
                    timer.longBkMinCust = longBkMinCust;

                } if (repeatNum != "") {
                    if (!Number.isInteger(parseFloat(repeatNum))) {
                        repeatNum = 1;
                        alert("Invalid value, only whole numbers. Saved as 1.");
                    }
                    timer.repeatNum = parseInt(repeatNum);

                }
                saveToStorage(timer);
            }
            saveToStorage(timer);
        }
    });

    //if a cust value is put in, save input in storage
    var inputs = document.getElementsByClassName('custInput');
    for (var inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        inputs[inputIndex].addEventListener('change', function validateCustInputs(e) {
            //set separate values for keeping the custom timer for later use
            // if (e.target && e.target.matches("input[type='number']")) {
            var studyMinCust = document.getElementById("studyMin").value;
            var shortBkMinCust = document.getElementById("shortBkMin").value;
            var cycleNumCust = document.getElementById("cycleNum").value;
            var longBkMinCust = document.getElementById("longBkMin").value;
            var repeatNum = document.getElementById("repeatNum").value;
            //check if any inputs
            if (studyMinCust != "") {
                console.log(studyMinCust);
                if (parseFloat(studyMinCust) <= 0) {
                    console.log(parseFloat(studyMinCust));
                    studyMinCust = 1;
                    alert("Invalid value, only positive numbers. Saved as 1.");
                }
                timer.studyMinCust = studyMinCust;


            } if (shortBkMinCust != "") {
                if (parseFloat(shortBkMinCust) <= 0) {
                    shortBkMinCust = 1;
                    alert("Invalid value, only positive numbers. Saved as 1.");
                }
                timer.shortBkMinCust = shortBkMinCust;


            } if (cycleNumCust != "") {
                if (!Number.isInteger(parseFloat(cycleNumCust))) {
                    cycleNumCust = 1;
                    alert("Invalid value, only whole numbers. Saved as 1.");
                }
                timer.cycleNumCust = parseInt(cycleNumCust);


            } if (longBkMinCust != "") {
                if (parseFloat(longBkMinCust) <= 0) {
                    longBkMinCust = 1;
                    alert("Invalid value, only positive numbers. Saved as 1.");
                }
                timer.longBkMinCust = longBkMinCust;

            } if (repeatNum != "") {
                if (!Number.isInteger(parseFloat(repeatNum))) {
                    repeatNum = 1;
                    alert("Invalid value, only whole numbers. Saved as 1.");
                }
                timer.repeatNum = parseInt(repeatNum);

            }

            saveToStorage(timer);
        });
    }

    //Begin session by getting timer informaiton
    beginButton.addEventListener('click', () => {
        validateTimerChoice();
    });

    //End session //end session button not working
    endButton.addEventListener('click', () => {

        answer = confirm("Reload page to remove timer?");
        if (!answer) {
            return;
        }

        if (!(timer.timeStudied === undefined ||
            timer.timeStudied === null ||
            timer.timeStudied.length === 0)) {
            data = {};
            console.log("data = " + timer.timeStudied + " " + timer.clickCount + " " + timer.keyCount);
            data.timeStudied = timer.timeStudied;
            data.clickCount = timer.clickCount
            data.keyCount = timer.keyCount
            try {
                fetch("http://127.0.0.1:5000/saveStudyData", {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: new Headers({
                        "content-type": "application/json"
                    })
                })
                    .then(function (response) {
                        if (response.ok) {
                            return response.json()
                        } else {
                            console.log("Response error status: ", response.status);
                        }
                    })
                    .then(function (message) {
                        console.log("Message: ", message);
                        timer.timeStudied = null;
                        timer.clickCount = null;
                        timer.keyCount = null;
                        saveToStorage(timer)
                    }).catch(function (error) {
                        console.log("Error on fetch: ", error);
                    })
            } catch (error) {
                console.log("Error on try: ", error);
            }

        }

        mainPageSettings();

        timer.state = "mainpg";
        messages.innerHTML = "";

        //reset count of study and short breaks
        timer.numStudy = 0;
        timer.numBreak = 0;
        timer.numLongBreak = 0;

        timer.endTime = "";

        saveToStorage(timer);
        chrome.tabs.reload();

    });

    //Show / hide whitelisting options 
    optionsBtn.addEventListener('click', () => {
        if (optionsBtn.innerHTML == "Whitelist Options") {
            //show the options
            var options = document.getElementById("options");
            options.style.display = "block";
            //change options button to hide options
            optionsBtn.innerHTML = "Hide Options";
            optionsBtn.style.marginLeft = "32%";
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
            optionsBtn.style.marginLeft = "28%";
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
                // console.log(response.farewell);
            });
        });
    });

    nextStep.addEventListener('click', () => {
        var answer = confirm("Ready to reload page for timer to begin?");
        if (!answer) {
            return;
        }
        //figure out if the next step is to study or break
        if (timer.numStudy == timer.cycleNum && timer.numBreak == (timer.cycleNum - 1)) {
            //long break time

            //save state to storage
            timer.state = "Long break";

            //display break mode
            PgTitle.innerHTML = "Long Break";
            breakPageSettings();

            //reset count of study and short breaks
            timer.numStudy = 0;
            timer.numBreak = 0;
            saveToStorage(timer);
            startTimer(timer.LBtime);

        } else if (timer.numStudy > timer.numBreak) {
            //short break

            //save state to storage
            timer.state = "break";

            //display study mode
            PgTitle.innerHTML = "Short Break";
            breakPageSettings();

            startTimer(timer.Btime);

        } else if (timer.numStudy == timer.numBreak) {
            //study time

            //save state to storage
            timer.state = "study";

            studyPageSettings();

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
        var answer = confirm("Ready to reload page for timer to begin?");
        if (!answer) {
            return;
        }
        //Extract information from choice
        var timerInfoArray = timerOp.value.split("/");
        var studyMin = timerInfoArray[0];
        var shortBkMin = timerInfoArray[1];
        var cycleNum = timerInfoArray[2];
        var longBkMin = timerInfoArray[3];
        var repeatNum = timerInfoArray[4];
        timer.studyMin = studyMin;
        timer.shortBkMin = shortBkMin;
        timer.cycleNum = cycleNum;
        timer.longBkMin = longBkMin;
        timer.repeatNum = repeatNum;

        //save state to storage
        timer.state = "study";
        saveToStorage(timer);
        studyPageSettings();
        startTimer(studyMin);
    }
}

function validateCustomTimer() {
    var studyMin = document.getElementById("studyMin").value;
    var shortBkMin = document.getElementById("shortBkMin").value;
    var cycleNum = document.getElementById("cycleNum").value;
    var longBkMin = document.getElementById("longBkMin").value;
    var repeatNum = document.getElementById("repeatNum").value;
    //check if all the inputs have been filled
    if (studyMin == "") {
        alert("Please fill all custom timer fields to begin");
    } else if (shortBkMin == "") {
        alert("Please fill all custom timer fields to begin");
    } else if (cycleNum == "") {
        alert("Please fill all custom timer fields to begin");
    } else if (longBkMin == "") {
        alert("Please fill all custom timer fields to begin");
    } else if (repeatNum == "") {
        alert("Please fill all custom timer fields to begin");
    } else {
        var answer = confirm("Ready to reload page for timer to begin?");
        if (!answer) {
            return;
        }
        timer.studyMin = studyMin;
        timer.shortBkMin = shortBkMin;
        timer.cycleNum = cycleNum;
        timer.longBkMin = longBkMin;
        timer.repeatNum = repeatNum;
        //save state to storage
        timer.state = "study";
        saveToStorage(timer);
        studyPageSettings();
        startTimer(studyMin);
    }
}

function startTimer(minutes) {

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
    chrome.storage.sync.set({ "popupData": serialized }, function () {
        // console.log('Value is set to ' + serialized);
    });
}

function mainPageSettings() {
    PgTitle.innerHTML = "Main Menu";
    userInfoInput.style.display = "block"; //can choose to remove this later or make it depend on if the user is logged in

    //no blocking
    const enabled = false;
    chrome.storage.local.set({ enabled });
    const breakTime = false;
    chrome.storage.local.set({ breakTime });

    timerDiv.style.display = "block"; //show timer options
    beginButton.style.display = "inline-block"; //show begin button
    pauseBtn.style.display = "none"; //do not display the other buttons
    nextStep.style.display = "none";
    endButton.style.display = "none";
    messages.style.display = "none";
}

function studyPageSettings() {
    //display it is in study mode
    var PgTitle = document.getElementById("PgTitle");
    PgTitle.innerHTML = "Study Mode";

    displayProgress();

    //turn on blocking for study period
    const enabled = true;
    chrome.storage.local.set({ enabled });

    //turn off breakTime blocking
    const breakTime = false;
    chrome.storage.local.set({ breakTime });

    timerDiv.style.display = "none"; //hide timer options
    beginButton.style.display = "none"; //hide begin
    endButton.style.display = "inline-block"; //show endbutton and pause button
    pauseBtn.style.display = "inline-block";
    nextStep.style.display = "none";
    userInfoInput.style.display = "none";
}

function interPageSettings() {
    displayProgress();

    var PgTitle = document.getElementById("PgTitle");
    PgTitle.innerHTML = "Intermission";

    //no blocking
    const enabled = false;
    chrome.storage.local.set({ enabled });
    const breakTime = false;
    chrome.storage.local.set({ breakTime });

    timerDiv.style.display = "none";
    beginButton.style.display = "none";
    endButton.style.display = "inline-block"; //only show end button
    pauseBtn.style.display = "none";
    userInfoInput.style.display = "none";
    nextStep.style.marginLeft = "-1%";
    nextStep.style.marginBottom = "5%";
    // nextStep.style.marginLeft = "35%";

}

function breakPageSettings() {
    displayProgress();

    healthyMsg.innerHTML += healthyMessage;

    // turn of study blocking
    const enabled = false;
    chrome.storage.local.set({ enabled });
    //turn on break blocking
    const breakTime = true;
    chrome.storage.local.set({ breakTime });

    timerDiv.style.display = "none";
    beginButton.style.display = "none";
    endButton.style.display = "inline-block"; //show end and pause only
    pauseBtn.style.display = "inline-block";
    userInfoInput.style.display = "none";
    nextStep.style.display = "none";
}

function pinValidationPageSettings(){

}

function displayProgress() {
    // display progress
    var progressMessage = "Study: " + timer.numStudy + "/" + timer.cycleNum
        + ", Short Break: " + timer.numBreak + "/" + (timer.cycleNum - 1)
        + ", Long Break: " + timer.numLongBreak + "/" + timer.repeatNum;
    messages.innerHTML = progressMessage;
    messages.style.display = "block";
}