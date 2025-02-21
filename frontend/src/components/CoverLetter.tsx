/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

export default function CoverLetter() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTabId = tabs[0]?.id;
      if (!activeTabId) {
        setResult("No active tab found");
        setLoading(false);
        return;
      }
      chrome.tabs.sendMessage(activeTabId, { action: "getPageContent" }, async (response) => {
        if (chrome.runtime.lastError) {
          setResult("Error: " + chrome.runtime.lastError.message);
          setLoading(false);
          return;
        }
        const pageContent = response.content;
        try {
          const res = await fetch("/api/generateCoverLetter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: pageContent })
          });
          const data = await res.json();
          setResult(data.coverLetter || "No cover letter generated.");
        } catch (error) {
          setResult("Error generating cover letter.");
        }
        setLoading(false);
      });
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading} style={{ padding: "8px 16px", cursor: "pointer" }}>
        {loading ? "Generating..." : "Generate Cover Letter"}
      </button>
      <div style={{ marginTop: "16px", whiteSpace: "pre-wrap" }}>{result}</div>
    </div>
  );
}