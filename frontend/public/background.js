// Get resume text
chrome.runtime.sendMessage(
  { type: "GET_RESUME" },
  (response) => {
    if (response.success) {
      setResumeText(response.resume);
    }
  }
);

// Save resume text
chrome.runtime.sendMessage(
  { type: "UPDATE_RESUME", text: resumeText },
  (response) => {
    if (response.success) {
      setIsSaved(true);
    }
  }
);

// Clear resume
chrome.runtime.sendMessage(
  { type: "CLEAR_RESUME" },
  (response) => {
    if (response.success) {
      setResumeText("");
    }
  }
);