import { useState } from "react";
import Navbar from "./components/Navbar";
import CoverLetter from "./components/CoverLetter";
import UserProfile from "./components/UserProfile";

export default function Popup() {
  const [activeTab, setActiveTab] = useState<"coverLetter" | "userProfile">("userProfile");

  return (
    <div className="p-4 font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-4">
        {activeTab === "coverLetter" ? <CoverLetter /> : <UserProfile />}
      </div>
    </div>
  );
}