browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapePageInfo") {
      const pageInfo = {
        trackTitle: document.querySelector('.trackTitle')?.textContent.trim(),
        bandName: document.querySelector('.trackTitle')?.closest('div')?.querySelector('h3 a')?.textContent.trim(),
        tags: Array.from(document.querySelectorAll('.tag')).map(tag => tag.textContent.trim())
      };
      sendResponse(pageInfo);
    }
  });