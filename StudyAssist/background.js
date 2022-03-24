var inSession = false; 
var timeMessage;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.timerMessage === "inSession"){
        inSession = true;
        timeMessage = request.endTimeString;
      }else if (request.timerMessage === "NotinSession"){
        inSession = false;
      }
      

  }
);


chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.get(["blocked", "enabled"], function (local) {
      if (!Array.isArray(local.blocked)) {
        chrome.storage.local.set({ blocked: [] });
      }
  
      if (typeof local.enabled !== "boolean") {
        chrome.storage.local.set({ enabled: false });
      }
    });
});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    const url = changeInfo.pendingUrl || changeInfo.url;
    if (!url || !url.startsWith("http")) {
      return;
    }
    const hostname = new URL(url).hostname;
  
    chrome.storage.local.get(["blocked", "enabled"], function (local) {
      const { blocked, enabled } = local;
      if (Array.isArray(blocked) && enabled && !blocked.find(domain => hostname.includes(domain))) {
        chrome.tabs.remove(tabId);
      }
    });
});

//this is not working right now bc I am injecting and including this file
//find a way to show the same timer progress on each tab
//Tell content js to put the script on the newly opened tab
//content.js injected to the tab

//Call content.js to load the timer into the local storage
// try{
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(inSession){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {timerMessage: "EndTime", endTimeString: timeMessage}, function(response) {
        });
    });
  }
});
// }catch(e){
//   console.log(e);
// }

// try{
//   chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
//     //then, inject the timer script
//     if (changeInfo.status == 'complete') {
//       chrome.scripting.executeScript({
//         target: {tabId: tabId, allFrames: true},
//         files: ['timerInject.js']
//       },
//       () => {});
//     }
//   });
// }catch(e){
//   console.log(e);
// }

//content.js in mainfest version 
// try{
//   chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {timerMessage: "reloadTimer"}, function(response) {
//       });
//     });
//   });
// }catch(e){
//   console.log(e);
// }

