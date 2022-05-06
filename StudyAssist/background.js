//Check for existing whitelist variables in storage, create if none
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(["blocked", "enabled", "breakTime"], function (local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] });
    }

    if (typeof local.enabled !== "boolean") {
      chrome.storage.local.set({ enabled: false });
    }

    if (typeof local.breakTime !== "breakTime") {
      chrome.storage.local.set({ enabled: false });
    }
  });
});

//When a tab is changed, called to check whitelist
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url;
  if (!url || !url.startsWith("http")) {
    return;
  }
  const hostname = new URL(url).hostname;

  chrome.storage.local.get(["blocked", "enabled", "breakTime"], function (local) {
    // console.log(hostname, local);
    const { blocked, enabled, breakTime} = local;

    if(enabled === true){
      // console.log("in study time check");
      // Whitelist during study time
      if (Array.isArray(blocked) && enabled && !blocked.find(domain => hostname.includes(domain))) {
        console.log(blocked);
        //remove
        chrome.tabs.remove(tabId);
        chrome.storage.sync.get(['popupData'], function(result) {
          if(!(result.popupData === undefined || result.popupData === null || result.popupData.length === 0)){
              var popupData = JSON.parse(result.popupData);
              popupData.lastBlockedPage = url;
              popupData.newBlockedPg = true;
              let serialized = JSON.stringify(popupData);
              chrome.storage.sync.set({"popupData": serialized}, function() {
                  // console.log('Value is set to ' + serialized);
              });
          }
        });
      };

    }else if(breakTime === true){
      console.log("in break time check");
      if (Array.isArray(blocked) && breakTime && blocked.find(domain => hostname.includes(domain)))  {

        console.log("in break time if");
        if (!hostname.includes("google")){
          // console.log("in break time check for google");
          chrome.tabs.remove(tabId);
        }
      }
    }
    
  
  })
});