import { useState, useRef, useEffect } from "react";

const API_BASE = "https://ai-agentic-backend1.onrender.com";

export default function App() {
  const [tab, setTab] = useState("chat");

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [repoUrl, setRepoUrl] = useState("");
  const [files, setFiles] = useState([]);

  const replyRef = useRef(null);

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [reply]);

  // ---------- CORE SEND ----------
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

  // ---------- CHAT ----------
  const handleChat = () => {
    if (!message.trim()) return;
    sendPrompt(message);
    setMessage("");
  };

  // ---------- GITHUB ANALYSIS ----------
  const handleRepoAnalysis = () => {
    if (!repoUrl.trim()) return;

    const prompt = `
You are a senior software engineer.

Analyze the following GitHub repository:
${repoUrl}

Explain:
1. Overall architecture
2. Code quality
3. Possible bugs or risks
4. Improvements
5. Best practices followed

Keep it clear and structured.
    `;
    sendPrompt(prompt);
  };

  // ---------- FILE ANALYSIS ----------
  const handleFileAnalysis = async () => {
    if (!files.length) return;

    let content = "";
    for (let file of files) {
      content += `\n\n===== FILE: ${file.name} =====\n`;
      content += await file.text();
    }

    const prompt = `
You are a senior software engineer.

Analyze the following code files:
${content}

Explain:
- What the code does
- Important logic
- Issues or bugs
- Improvements
- Best practices
    `;
    sendPrompt(prompt);
  };

  // ---------- ENTER KEY ----------
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChat();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>AI Code Review Dashboard</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button onClick={() => setTab("chat")}>Chat</button>
          <button onClick={() => setTab("repo")}>GitHub Repo</button>
          <button onClick={() => setTab("files")}>File Analysis</button>
        </div>

        {/* CHAT */}
        {tab === "chat" && (
          <>
            <textarea
              style={styles.textarea}
              placeholder="Ask anything (Enter to send, Shift+Enter for new line)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleChat}>Ask AI</button>
          </>
        )}

        {/* GITHUB */}
        {tab === "repo" && (
          <>
            <input
              style={styles.input}
              placeholder="Paste GitHub repository URL"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
            <button onClick={handleRepoAnalysis}>Analyze Repository</button>
          </>
        )}

        {/* FILES */}
        {tab === "files" && (
          <>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
            <button onClick={handleFileAnalysis}>Analyze Files</button>
          </>
        )}

        {loading && <p style={styles.thinking}>🤖 AI is thinking…</p>}
        {reply && (
          <pre ref={replyRef} style={styles.reply}>
            {reply}
          </pre>
        )}
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
    width: "850px",
    background: "#020617",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
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
    padding: "10px",
    borderRadius: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
  },
  thinking: {
    marginTop: "10px",
    opacity: 0.8,
    animation: "pulse 1.2s infinite",
  },
  reply: {
    background: "#020617",
    padding: "15px",
    marginTop: "15px",
    whiteSpace: "pre-wrap",
    borderRadius: "10px",
  },
  error: {
    color: "red",
  },
};
