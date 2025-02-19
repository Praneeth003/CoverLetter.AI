chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageContent") {
    const content = document.body.innerText;
    sendResponse({ content });
  }
  return true;
});