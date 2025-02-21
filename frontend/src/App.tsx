import { useState } from "react";
import Navbar from "./components/Navbar";
import CoverLetter from "./components/CoverLetter";
import UserProfile from "./components/UserProfile";

export default function Popup() {
  const [activeTab, setActiveTab] = useState<"coverLetter" | "userProfile">("coverLetter");

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ marginTop: "16px" }}>
        {activeTab === "coverLetter" ? <CoverLetter /> : <UserProfile />}
      </div>
    </div>
  );
}