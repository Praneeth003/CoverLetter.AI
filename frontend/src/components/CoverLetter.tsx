import { useState} from "react";

interface CoverLetterProps {
  coverLetter: string;
  setCoverLetter: (letter: string) => void;
  originalCoverLetter: string;
  setOriginalCoverLetter: (letter: string) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  resume: string;
}

export default function CoverLetter({
  coverLetter,
  setCoverLetter,
  originalCoverLetter,
  setOriginalCoverLetter,
  jobDescription,
  setJobDescription,
  resume
}: CoverLetterProps) {
  // Keep only local state variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRevising, setIsRevising] = useState(false);
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [viewingOriginal, setViewingOriginal] = useState(false);
  
  const serverUrl = import.meta.env.VITE_SERVER_URL;

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
      
      // Store job description for potential revisions
      setJobDescription(contentOnScreen.content);
      
      if (!contentOnScreen) {
        throw new Error("Could not read anything on the screen");
      }
      
      if (!resume) {
        throw new Error("Please add your resume in the User Profile tab before generating a cover letter");
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

      // Safely parse the JSON data
      let parsedData;
      try {
        // Check if data.content is already a valid object or needs parsing
        parsedData = typeof data.content === 'object' ? data.content : JSON.parse(data.content);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Failed to process the response from server");
      }

      if(parsedData?.is_job_description === false){
        console.log("The extension could not find a valid job description on the current tab!!");
        throw new Error("The extension could not find a valid job description on current tab!!");
      }
      
      if(parsedData?.is_resume === false){
        console.log("The resume provided does not seem to be valid!!");
        throw new Error("The resume provided does not seem to be a valid resume!!");
      }
      
      const newCoverLetter = parsedData?.cover_letter;
      setCoverLetter(newCoverLetter);
      setOriginalCoverLetter(newCoverLetter);
      setViewingOriginal(false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate cover letter";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevise = async () => {
    if (!revisionInstructions) {
      setError("Please provide revision instructions");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const apiResponse = await fetch(`${serverUrl}/reviseCoverLetter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          existingCoverLetter: coverLetter, 
          revisionInstructions, 
          resume, 
          jobDescription 
        })
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to revise cover letter");
      }
      
      const data = await apiResponse.json();

      // For the revision endpoint, process the response according to expected format
      let revisedCoverLetter;
      try {
        // If content is already an object
        if (typeof data.content === 'object') {
          revisedCoverLetter = data.content.modified_cover_letter || data.content.cover_letter;
        } else {
          // Try parsing as JSON to see if we get an object with modified_cover_letter
          try {
            const parsed = JSON.parse(data.content);
            
            if (!parsed.is_valid) {
              throw new Error("The revision instructions are not valid for a professional cover letter");
            }
            
            revisedCoverLetter = parsed.modified_cover_letter || parsed.cover_letter || data.content;
          } catch (parseError) {
            // If parsing fails, use the content directly as the cover letter
            revisedCoverLetter = data.content;
          }
        }
        
        if (!revisedCoverLetter) {
          throw new Error("No valid cover letter content was returned");
        }
        
      } catch (parseError) {
        console.error("Error processing response:", parseError);
        throw new Error("Failed to process the response from server");
      }
      
      setCoverLetter(revisedCoverLetter);
      setViewingOriginal(false);
      setIsRevising(false);
      setRevisionInstructions("");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to revise cover letter";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setViewingOriginal(!viewingOriginal);
  };

  const displayedCoverLetter = viewingOriginal ? originalCoverLetter : coverLetter;
  const hasRevision = coverLetter !== originalCoverLetter;

  return (
     <div className="p-4">
      {!resume && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm">
          Please add your resume in the User Profile tab before generating a cover letter.
        </div>
      )}
      
      {!coverLetter ? (
        <button 
          onClick={handleGenerate} 
          disabled={!resume || loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate Cover Letter"}
        </button>
      ) : (
        <div>
          {!isRevising ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsRevising(true)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Revise
              </button>
              <button 
                onClick={() => {
                  setCoverLetter("");
                  setOriginalCoverLetter("");
                  setViewingOriginal(false);
                }}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Start Over
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <textarea
                value={revisionInstructions}
                onChange={(e) => setRevisionInstructions(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                rows={3}
                placeholder="Enter your revision instructions here (e.g., 'Make it more formal', 'Focus more on my leadership skills')"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleRevise}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Revising..." : "Apply Changes"}
                </button>
                <button 
                  onClick={() => setIsRevising(false)}
                  className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {error && <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded text-sm">{error}</div>}
      
      {coverLetter && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Generated Cover Letter:</h3>
            {hasRevision && (
              <button
                onClick={toggleView}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {viewingOriginal ? "Show Current Version" : "Show Original"}
              </button>
            )}
          </div>
          <div className="p-3 border rounded bg-white whitespace-pre-wrap">
            {displayedCoverLetter}
          </div>
          {viewingOriginal && hasRevision && (
            <div className="mt-2 text-sm text-gray-600">
              You are viewing the original cover letter. Click "Show Current Version" to see your revisions.
            </div>
          )}
        </div>
      )}
    </div>
  );
}