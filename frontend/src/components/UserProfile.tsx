import { useState, useEffect } from "react";

interface UserProfileProps {
  resume: string;
  setResume: (text: string) => void;
}

export default function UserProfile({ resume, setResume }: UserProfileProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Set initial save status based on if resume exists
  useEffect(() => {
    setSaveStatus(resume ? "saved" : "idle");
  }, [resume]);

  const handleSave = () => {
    setSaveStatus("saving");
    chrome.runtime.sendMessage(
      { type: "UPDATE_RESUME", text: resume },
      (response) => {
        if (response.success) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      }
    );
  };

  const handleClear = () => {
    chrome.runtime.sendMessage(
      { type: "CLEAR_RESUME" },
      (response) => {
        if (response.success) {
          setResume("");
          setSaveStatus("idle");
        }
      }
    );
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Profile</h1>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Resume Content:
          <textarea
            value={resume}
            onChange={(e) => {
              setResume(e.target.value);
              if (saveStatus === "saved") setSaveStatus("idle");
            }}
            className="w-full mt-1 p-3 border rounded-lg h-64 resize-none
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200"
            placeholder="Enter your resume text here..."
          />
        </label>
      </div>

      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className={`px-4 py-2 rounded-md text-sm font-medium
              ${saveStatus === "saving" ? "bg-blue-400 cursor-wait" : 
               saveStatus === "saved" ? "bg-green-500" : 
               "bg-blue-600 hover:bg-blue-700"} text-white`}
          >
            {saveStatus === "saving" ? "Saving..." : 
             saveStatus === "saved" ? "Saved!" : 
             "Save Resume"}
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-red-600
              hover:bg-red-50 rounded-md"
          >
            Clear
          </button>
        </div>

        {saveStatus === "error" && (
          <span className="text-red-500 text-sm">
            Error saving resume. Please try again.
          </span>
        )}
      </div>
    </div>
  );
}