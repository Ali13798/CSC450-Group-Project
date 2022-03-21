
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

chrome.runtime.onMessage.addListener((msg) => {
    if(msg.message == "begin"){
        if(!checkbox.checked){ //if not checked
            checkbox.click() //then check it
        }
    }else if(msg.message == "end"){
        if(checkbox.checked){ //if checked
            checkbox.click() //then uncheck it
        }
    }else if(msg.message == "StartTimer"){
      
    }
    return true;  
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

//Working on the whitlist aspect
// chrome.runtime.onMessage.addListener((msg) => {
//     if(msg.message == "break"){
//         chrome.webRequest.onBeforeRequest.addListener(
//             function () {
//                 return {cancel:true};
//             },
//             {
//                 urls: ["*://*.edu/*"]
//             },
//             ["blocking"]
//         );
//     }else if (msg.message == "begin"){
//         chrome.webRequest.onBeforeRequest.addListener(
//             function () {
//                 return {cancel:true};
//             },
//             {
//                 urls: ["*://*.com/*"]
//             },
//             ["blocking"]
//         );
//     }else if(msg.message == "end"){
//     }
//     return true;  
// });
