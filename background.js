browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const targetUrl = "bandcamp.com/album";
  const targetUrl2 = "bandcamp.com/track";
  const isAlbumPage = tab.url && tab.url.includes(targetUrl);
  const isTrackPage = tab.url && tab.url.includes(targetUrl2);
  const isAlbumOrTrackPage = isAlbumPage || isTrackPage;

  
  browser.browserAction.setIcon({
    path: isAlbumOrTrackPage ? "./icons/bandcamp-logo-aqua.png" : "./icons/bandcamp-logo-grey.png",
    tabId: tabId
  });

  if (isAlbumOrTrackPage) {
    browser.tabs.sendMessage(tabId, {action: "scrapePageInfo"})
      .then(pageInfo => {
        if (pageInfo) {
          const redirectUrl = createRedirectUrl(pageInfo, tab.url);
          browser.storage.local.set({ 
            isAlbumOrTrackPage: isAlbumOrTrackPage,
            currentUrl: tab.url,
            redirectUrl: redirectUrl
          });
        }
      });
    
    browser.browserAction.setPopup({
      tabId: tabId,
      popup: "popup/share_link.html"
    });
  } else {
    browser.browserAction.setPopup({
      tabId: tabId,
      popup: ""
    });
  }
  
  browser.storage.local.set({ 
    isAlbumOrTrackPage: isAlbumOrTrackPage,
    currentUrl: tab.url
  });
});

// Click listener for no popup
browser.browserAction.onClicked.addListener((tab) => {
  browser.storage.local.get("isAlbumOrTrackPage").then((result) => {
    if (result.isAlbumOrTrackPage) {
      browser.browserAction.setPopup({
        tabId: tab.id,
        popup: "popup/share_link.html"
      });
      browser.browserAction.openPopup();
    }
  });
});

// Current state
function getAlbumPageState() {
  return browser.storage.local.get('isAlbumOrTrackPage')
    .then(result => result.isAlbumOrTrackPage || false);
}

function createRedirectUrl(pageInfo, currentUrl) {
  const { bandName, trackTitle, tags } = pageInfo;
  const formattedTags = tags.map(tag => {
    // camelCase
    return '#' + tag.split(' ').map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join('');
  }).join(' ');
  
  return `${bandName} - ${trackTitle}\n\n${currentUrl}\n\n${formattedTags}`;
}

// Message listener 
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getRedirectUrl") {
    browser.storage.local.get("redirectUrl")
      .then(result => sendResponse(result.redirectUrl));
    return true; // Response is sent asynchronously
  }
});