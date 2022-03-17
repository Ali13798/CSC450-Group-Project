//Working on the whitlist aspect

chrome.runtime.onInstalled.addListener(() => {
    chrome.webRequest.onBeforeRequest.addListener(
        function () {
            return {cancel:true};
        },
        {
            urls: ["*://*.com/*"]
        },
        ["blocking"]
    );
});
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