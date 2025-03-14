let keepAliveTimer;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle resume storage
  if (request.type === "STORE_RESUME") {
    chrome.storage.local.set({ resume: request.data }, () => {
      sendResponse({ 
        success: !chrome.runtime.lastError,
        error: chrome.runtime.lastError,
        data: request.data
      });
    });
    return true;
  }

  // Handle resume removal
  if (request.type === "REMOVE_RESUME") {
    chrome.storage.local.remove('resume', () => {
      sendResponse({ 
        success: !chrome.runtime.lastError,
        error: chrome.runtime.lastError
      });
    });
    return true;
  }

  // Handle resume retrieval
  if (request.type === "GET_RESUME") {
    chrome.storage.local.get('resume', (result) => {
      sendResponse({ 
        success: !chrome.runtime.lastError,
        error: chrome.runtime.lastError,
        data: result.resume
      });
    });
    return true;
  }

  // Handle keep-alive
  if (request.type === "KEEP_ALIVE") {
    keepAliveTimer = setTimeout(() => sendResponse({ alive: true }), 250);
    return true;
  }

  // Handle unknown messages
  sendResponse({
    success: false,
    error: "Unsupported message type"
  });
});

// Cleanup on extension unload
chrome.runtime.onSuspend.addListener(() => {
  clearTimeout(keepAliveTimer);
});