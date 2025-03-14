import { useState, useEffect } from "react";

export default function UserProfile() {
  const [resume, setResume] = useState<File | null>(null);
  const [storedResume, setStoredResume] = useState<string | null>(null);

  // Load stored resume on component mount
  useEffect(() => {
    chrome.storage.local.get(['resume'], (result) => {
      if (result.resume) {
        setStoredResume(result.resume);
      }
    });
  }, []);

  const handleResumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setResume(file);

      // Convert file to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result as string;
        
        // Store in Chrome's local storage
        chrome.storage.local.set({ resume: base64Data }, () => {
          console.log('Resume saved locally');
          setStoredResume(base64Data);
        });
      };
    }
  };

  const handleRemoveResume = () => {
    chrome.storage.local.remove('resume', () => {
      setResume(null);
      setStoredResume(null);
      console.log('Resume removed');
    });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium">
          Upload Resume (PDF or DOC):
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeChange}
            className="block w-full mt-1 text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </div>

      {storedResume && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">
            Stored Resume: {resume?.name || 'resume-file'}
          </p>
          <div className="mt-2 flex gap-2">
            <a
              href={storedResume}
              download="resume"
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              Download
            </a>
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