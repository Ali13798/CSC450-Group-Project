//Check for existing whitelist variables in storage, create if none
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(["blocked", "enabled", "breakTime"], function (local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] });
    }

    if (typeof local.enabled !== "boolean") {
      chrome.storage.local.set({ enabled: false });
    }

    if (typeof local.enabled !== "breakTime") {
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
    const { blocked, enabled, breakTime} = local;

    // Whitelist during study time
    if (Array.isArray(blocked) && enabled && !blocked.find(domain => hostname.includes(domain))) {
      console.log(blocked);
      //remove
      chrome.tabs.remove(tabId);
      chrome.storage.sync.get(['popupState'], function(result) {
        if(!(result.popupState === undefined || result.popupState === null || result.popupState.length === 0)){
            var popupState = JSON.parse(result.popupState);
            popupState.lastBlockedPage = url;
            popupState.newBlockedPg = true;
            let serialized = JSON.stringify(popupState);
            chrome.storage.sync.set({"popupState": serialized}, function() {
                console.log('Value is set to ' + serialized);
            });
        }
      });

    //Black list during break time
    }else if (Array.isArray(blocked) && breakTime && blocked.find(domain => hostname.includes(domain)))  {
      chrome.tabs.remove(tabId);
    }
  });
});