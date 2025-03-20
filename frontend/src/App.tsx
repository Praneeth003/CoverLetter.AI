import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CoverLetter from "./components/CoverLetter";
import UserProfile from "./components/UserProfile";

export default function Popup() {
  const [activeTab, setActiveTab] = useState<"coverLetter" | "userProfile">("userProfile");
  // Lift state up from CoverLetter component
  const [coverLetter, setCoverLetter] = useState("");
  const [originalCoverLetter, setOriginalCoverLetter] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  
  // Load resume once at the app level
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_RESUME" }, (response) => {
      if (response.success) {
        setResume(response.resume);
      }
    });
  }, []);

  return (
    <div className="p-4 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-4">
        {activeTab === "coverLetter" ? (
          <CoverLetter
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            originalCoverLetter={originalCoverLetter}
            setOriginalCoverLetter={setOriginalCoverLetter}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            resume={resume}
          />
        ) : (
          <UserProfile resume={resume} setResume={setResume} />
        )}
      </div>
    </div>
  );
}