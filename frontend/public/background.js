// Keep service worker alive to prevent it from being killed by the browser
const KEEP_ALIVE_ALARM_NAME = "keepAliveAlarm";

const setupKeepAlive = () => {
  // Create an alarm that fires every 25 seconds
  chrome.alarms.create(KEEP_ALIVE_ALARM_NAME, {
    periodInMinutes: 25/60 // Convert seconds to minutes
  });
  
  // Listen for the alarm
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === KEEP_ALIVE_ALARM_NAME) {
      console.log("Keep-alive ping");
      // Do any maintenance tasks here if needed
    }
  });
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

// Clean up on suspend
chrome.runtime.onSuspend.addListener(() => {
  chrome.alarms.clear(KEEP_ALIVE_ALARM_NAME);
});