import { useState } from "react";

const API_BASE = "https://ai-agentic-backend1.onrender.com";

export default function App() {
  const [tab, setTab] = useState("chat");

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendPrompt = async (prompt) => {
    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setReply(data.reply);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (!message.trim()) return;
    sendPrompt(message);
  };

  const handleRepoAnalysis = () => {
    if (!repoUrl.trim()) return;

    const prompt = `
Analyze the following GitHub repository in detail.
Explain:
- Architecture
- Code quality
- Improvements
- Best practices

Repository URL:
${repoUrl}
    `;
    sendPrompt(prompt);
  };

  const handleFileAnalysis = async () => {
    if (!files.length) return;

    let content = "";
    for (let file of files) {
      content += `\n\nFILE: ${file.name}\n`;
      content += await file.text();
    }

    const prompt = `
Analyze and explain the following code files clearly.
Focus on logic, issues, and improvements.

${content}
    `;
    sendPrompt(prompt);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>AI Code Review Dashboard</h1>

        <div style={styles.tabs}>
          <button onClick={() => setTab("chat")}>Chat</button>
          <button onClick={() => setTab("repo")}>GitHub Repo</button>
          <button onClick={() => setTab("file")}>File Upload</button>
        </div>

        {tab === "chat" && (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Ask anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleChat}>Ask AI</button>
          </>
        )}

        {tab === "repo" && (
          <>
            <input
              style={styles.input}
              placeholder="Paste GitHub repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button onClick={handleRepoAnalysis}>
              Analyze Repository
            </button>
          </>
        )}

        {tab === "file" && (
          <>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button onClick={handleFileAnalysis}>
              Analyze Files
            </button>
          </>
        )}

        {loading && <p>⏳ Thinking...</p>}
        {reply && <pre style={styles.reply}>{reply}</pre>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#020617,#0f172a)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  card: {
    width: "800px",
    background: "#020617",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
  },
  reply: {
    background: "#020617",
    padding: "15px",
    marginTop: "15px",
    whiteSpace: "pre-wrap",
    borderRadius: "8px",
  },
  error: {
    color: "red",
  },
};
