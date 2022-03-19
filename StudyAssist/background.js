//Working on the whitlist aspect
chrome.runtime.onMessage.addListener((msg) => {
    // console.log("in background");
    // console.log("about to block");
    if(msg.message == "end"){
        chrome.webRequest.onBeforeRequest.addListener(
            function () {
                return {cancel:true};
            },
            {
                urls: ["*://*.edu/*"]
            },
            ["blocking"]
        );
    }else{
        chrome.webRequest.onBeforeRequest.addListener(
            function () {
                return {cancel:true};
            },
            {
                urls: ["*://*.com/*"]
            },
            ["blocking"]
        );
        
    }
    return true;  
});


//Mackensie - Research on alternative blocking methods: 
// let wait = 1000;
// async function checkCurrentTab() {
//     let queryOptions = { active: true, currentWindow: true };
//     let [tab] = await chrome.tabs.query(queryOptions);
//     var tabsToRemove = [];
//     if (tab){
//         if (!tab.pendingUrl.includes(".edu")){
//             tabsToRemove.push(tab.id)
//             chrome.tabs.remove(tabsToRemove).then(function(){});
//         }
//     }else{
//         console.log("none")
//     }
// }
// let interval = setInterval(checkCurrentTab, wait);