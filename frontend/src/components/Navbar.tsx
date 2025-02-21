interface NavbarProps {
  activeTab: "coverLetter" | "userProfile";
  setActiveTab: (tab: "coverLetter" | "userProfile") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid #ccc", paddingBottom: "8px" }}>
      <button
        onClick={() => setActiveTab("coverLetter")}
        style={{
          background: activeTab === "coverLetter" ? "#0070f3" : "#fff",
          color: activeTab === "coverLetter" ? "#fff" : "#000",
          border: "1px solid #0070f3",
          padding: "8px 16px",
          cursor: "pointer"
        }}
      >
        Generate Cover Letter
      </button>

      <button
        onClick={() => setActiveTab("userProfile")}
        style={{
          background: activeTab === "userProfile" ? "#0070f3" : "#fff",
          color: activeTab === "userProfile" ? "#fff" : "#000",
          border: "1px solid #0070f3",
          padding: "8px 16px",
          cursor: "pointer"
        }}
      >
        User Profile
      </button>
    </div>
  );
}