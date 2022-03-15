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
