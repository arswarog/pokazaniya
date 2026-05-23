const SITE_URL = 'https://62.33.168.51:6001/';

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: SITE_URL });
});
