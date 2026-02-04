import { useState } from "react";

const API_BASE = "https://ai-agentic-backend.onrender.com";

export default function App() {
  const [mode, setMode] = useState("chat");
  const [message, setMessage] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState([]);

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callApi = async (url, options) => {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return data;
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    const data = await callApi(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (data) setOutput(data.reply);
  };

  const handleRepo = async () => {
    const data = await callApi(`${API_BASE}/full-code-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo_url: repoUrl }),
    });
    if (data) setOutput(data.full_code_review);
  };

  const handleFiles = async () => {
    const formData = new FormData();
    for (const f of files) formData.append("files", f);

    const data = await callApi(`${API_BASE}/explain-file`, {
      method: "POST",
      body: formData,
    });
    if (data) setOutput(data.analysis);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>AI Code Review Dashboard</h1>

        <div style={styles.tabs}>
          <button onClick={() => setMode("chat")}>Chat</button>
          <button onClick={() => setMode("repo")}>GitHub Repo</button>
          <button onClick={() => setMode("file")}>File Upload</button>
        </div>

        {mode === "chat" && (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Ask something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleChat}>Ask AI</button>
          </>
        )}

        {mode === "repo" && (
          <>
            <input
              style={styles.input}
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button onClick={handleRepo}>Analyze Repo</button>
          </>
        )}

        {mode === "file" && (
          <>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
            <button onClick={handleFiles}>Analyze Files</button>
          </>
        )}

        {loading && <p>Processing...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {output && <pre style={styles.output}>{output}</pre>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  card: {
    width: "900px",
    background: "#020617",
    padding: "30px",
    borderRadius: "12px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "10px",
  },
  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "8px",
  },
  output: {
    marginTop: "15px",
    whiteSpace: "pre-wrap",
    maxHeight: "400px",
    overflow: "auto",
  },
};
