import { useState } from "react";
import { chatWithAI, fullCodeReview, uploadFilesForAnalysis } from "./api";

export default function App() {
  const [tab, setTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChat = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await chatWithAI(message);
      setReply(res.data.reply);
    } catch {
      setError("Chat failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRepoReview = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fullCodeReview(repoUrl);
      setReply(res.data.full_code_review);
    } catch {
      setError("GitHub analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await uploadFilesForAnalysis(files);
      setReply(res.data.analysis);
    } catch {
      setError("File analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial" }}>
      <h1>AI Code Review Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab("chat")}>Chat</button>
        <button onClick={() => setTab("github")}>GitHub Review</button>
        <button onClick={() => setTab("files")}>File Upload</button>
      </div>

      {tab === "chat" && (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask something..."
            style={{ width: "100%", height: 100 }}
          />
          <button onClick={handleChat}>Send</button>
        </>
      )}

      {tab === "github" && (
        <>
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHub repo URL"
            style={{ width: "100%" }}
          />
          <button onClick={handleRepoReview}>Analyze</button>
        </>
      )}

      {tab === "files" && (
        <>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
          />
          <button onClick={handleFileUpload}>Upload</button>
        </>
      )}

      {loading && <p>Processing...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {reply && (
        <pre style={{ background: "#f4f4f4", padding: 20 }}>{reply}</pre>
      )}
    </div>
  );
}
