import { useState } from "react";

const API_BASE = "https://ai-agentic-backend1.onrender.com";

export default function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>AI Code Review Dashboard</h1>

        <textarea
          style={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything..."
        />

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        {reply && <pre style={styles.reply}>{reply}</pre>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  card: {
    width: "720px",
    background: "#020617",
    padding: "30px",
    borderRadius: "12px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "12px",
  },
  reply: {
    background: "#020617",
    padding: "15px",
    marginTop: "15px",
    whiteSpace: "pre-wrap",
  },
  error: {
    color: "red",
  },
};
