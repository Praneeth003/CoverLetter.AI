import { useState, useEffect } from "react";


export default function CoverLetter() {
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Load the saved resume when the component mounts
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_RESUME" }, (response) => {
      if (response.success) {
        setResume(response.resume);
      }
    });
  }, []);


  const handleGenerate = async () => {
    setLoading(true);
    setError("");
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

      const contentOnScreen = (response as { content: string });
      console.log('contentOnScreen:', contentOnScreen);


      
      if (!contentOnScreen) {
        throw new Error("No page content found");
      }
      

      if (!resume) {
        throw new Error("No resume content found");
      }

      // Send an API request
      const apiResponse = await fetch(`${serverUrl}/generateCoverLetter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: contentOnScreen.content, resume: resume })
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to generate cover letter");
      }
      
      const data = await apiResponse.json();
      setCoverLetter(data.content); // Backend returns { content: ... }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="p-4">
      {!resume && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm">
          Please add your resume in the User Profile tab before generating a cover letter.
        </div>
      )}
      
      <button 
        onClick={handleGenerate} 
        disabled={loading || !resume}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>
      
      {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-sm">{error}</div>}
      
      {coverLetter && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Generated Cover Letter:</h3>
          <div className="p-3 border rounded bg-white whitespace-pre-wrap">{coverLetter}</div>
        </div>
      )}
    </div>
  );
}