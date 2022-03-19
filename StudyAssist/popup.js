//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    var textarea = document.getElementById("textarea");
    var save = document.getElementById("save");
    var checkbox = document.getElementById("checkbox");

    //load the text area with our list of approved websites
    textarea.innerHTML = "blackboard.missouristate.edu \nclassroom.google.com  \nwww.office.com  \ndrive.google.com \nowl.purdue.edu";

    document.getElementById("beginSession").addEventListener('click', () => {
       if(!checkbox.checked){
           checkbox.click();
       }
    });

    document.getElementById("endSession").addEventListener('click', () => {
        if(checkbox.checked){
            checkbox.click();
        }
    });

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
            optionsBtn.innerHTML = "Options";
        }
    });

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
    
    window.addEventListener("DOMContentLoaded", () => {
        //get the list of sites and the user's choice of enabled from local storage
        chrome.storage.local.get(["blocked", "enabled"], function (local) {
            const { blocked, enabled } = local;
            if (Array.isArray(blocked)) {
            textarea.value = blocked.join("\n");
            checkbox.checked = enabled;
            }
        });
    });
});

