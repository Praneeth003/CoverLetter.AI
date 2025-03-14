import { useState, useEffect, useRef } from "react";

export default function UserProfile() {
  const [resume, setResume] = useState<string | null>(null);
  const [storedResume, setStoredResume] = useState<string | null>(null);
  const keepAliveRef = useRef<number | null>(null);

  // Keep extension context alive
  useEffect(() => {
    keepAliveRef.current = setInterval(() => {
      chrome.runtime.sendMessage({ type: "KEEP_ALIVE" });
    }, 15000);

    return () => {
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    };
  }, []);

  // Load stored resume
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_RESUME" },
      (response) => {
        if (response?.success && response.data) {
          setStoredResume(response.data);
          setResume(response.data);
        }
      }
    );
  }, []);

  const handleResumeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newResume = event.target.value;
    setResume(newResume);

    chrome.runtime.sendMessage(
      { type: "STORE_RESUME", data: newResume },
      (response) => {
        if (response?.success) {
          setStoredResume(newResume);
        }
      }
    );
  };

  const handleRemoveResume = () => {
    chrome.runtime.sendMessage(
      { type: "REMOVE_RESUME" },
      (response) => {
        if (response?.success) {
          setResume(null);
          setStoredResume(null);
        }
      }
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Enter Resume:
          <textarea
            value={resume || ''}
            onChange={handleResumeChange}
            className="w-full h-40 p-2 border border-gray-300 rounded"
          />
        </label>
      </div>

      {storedResume && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">
            Stored Resume:
          </p>
          <pre className="whitespace-pre-wrap">{storedResume}</pre>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleRemoveResume}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}