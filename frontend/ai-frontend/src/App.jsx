import { useState, useRef, useEffect } from "react";

const API_BASE = "https://ai-agentic-backend1.onrender.com";

export default function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const replyRef = useRef(null);

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [reply]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setReply(data.reply);
      setMessage("");
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessage("");
    setReply("");
    setError("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>AI Code Review Dashboard</h1>

        <textarea
          style={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything (Enter to send, Shift+Enter for new line)"
        />

        <div style={styles.actions}>
          <button onClick={sendMessage} disabled={loading}>
            {loading ? "Thinking..." : "Ask AI"}
          </button>
          <button onClick={clearChat} style={styles.secondary}>
            Clear
          </button>
        </div>

        {loading && <p style={styles.thinking}>🤖 AI is thinking…</p>}

        {reply && (
          <pre style={styles.reply} ref={replyRef}>
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
    width: "800px",
    background: "#020617",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
    animation: "fadeIn 0.4s ease",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "12px",
    padding: "10px",
    borderRadius: "8px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  secondary: {
    background: "#1e293b",
    color: "white",
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
    animation: "slideUp 0.3s ease",
  },
  error: {
    color: "red",
  },
};
