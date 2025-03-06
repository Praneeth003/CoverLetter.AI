import { useState } from "react";

export default function CoverLetter() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTabId = tabs[0]?.id;
      
      if (!activeTabId) {
        throw new Error("No active tab found");
      }

      // Ensure content script is injected
      await chrome.scripting.executeScript({
        target: { tabId: activeTabId },
        files: ['content.js']
      });

      // Use a JavaScript Promise for chrome.tabs.sendMessage
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(activeTabId, { action: "getPageContent" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      const typedResponse = response as { content: string };
      setResult("Cover letter generated is: " + typedResponse.content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
      setResult("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleGenerate} 
        disabled={loading} 
        style={{ padding: "8px 16px", cursor: "pointer" }}
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>
      <div style={{ marginTop: "16px", whiteSpace: "pre-wrap" }}>{result}</div>
    </div>
  );
}