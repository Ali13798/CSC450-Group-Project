//Clicking on the button starts the blocking session
document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("beginSession").addEventListener('click', () => {
        console.log("button clicked, start session");
        chrome.runtime.sendMessage({message: "begin session"}, function(response){

        });
    });
});