interface NavbarProps {
  activeTab: "coverLetter" | "userProfile";
  setActiveTab: (tab: "coverLetter" | "userProfile") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <div className="flex gap-4 border-b border-gray-300 pb-2">
      <button
        onClick={() => setActiveTab("coverLetter")}
        className={`
          px-4 py-2 rounded-md border border-blue-600 transition-colors
          ${activeTab === 'coverLetter' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-black hover:bg-blue-100'}
        `}
      >
        Generate Cover Letter
      </button>

      <button
        onClick={() => setActiveTab("userProfile")}
        className={`
          px-4 py-2 rounded-md border border-blue-600 transition-colors
          ${activeTab === 'userProfile' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-black hover:bg-blue-100'}
        `}
      >
        User Profile
      </button>
    </div>
  );
}