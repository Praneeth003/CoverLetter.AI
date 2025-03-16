// Keep service worker alive to prevent it from being killed by the browser
let keepAliveTimer;

const setupKeepAlive = () => {
  const resetTimer = () => {
    keepAliveTimer = setTimeout(() => {
      chrome.runtime.sendMessage({ type: "KEEP_ALIVE" });
      resetTimer();
    }, 25000);
  };
  resetTimer();
};

// Message handling
// switch statement to handle different message types
// GET_RESUME: get the resume text from storage
// UPDATE_RESUME: update the resume text in storage
// CLEAR_RESUME: clear the resume text from storage
// KEEP_ALIVE: keep the service worker alive
// default: send an error response for unknown message types

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "GET_RESUME":
      chrome.storage.local.get(['resume'], (result) => {
        sendResponse({
          success: true,
          resume: result.resume || ""
        });
      });
      return true;

    case "UPDATE_RESUME":
      chrome.storage.local.set({ resume: request.text }, () => {
        sendResponse({
          success: !chrome.runtime.lastError,
          error: chrome.runtime.lastError
        });
      });
      return true;

    case "CLEAR_RESUME":
      chrome.storage.local.remove('resume', () => {
        sendResponse({
          success: !chrome.runtime.lastError,
          error: chrome.runtime.lastError
        });
      });
      return true;

    case "KEEP_ALIVE":
      sendResponse({ alive: true });
      return true;

    default:
      sendResponse({
        success: false,
        error: "Unknown message type"
      });
      return true;
  }
});

// Initial setup
setupKeepAlive();
chrome.runtime.onSuspend.addListener(() => {
  clearTimeout(keepAliveTimer);
});