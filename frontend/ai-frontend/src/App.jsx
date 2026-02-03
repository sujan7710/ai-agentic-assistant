import { useState } from "react";

const API_BASE = "https://ai-agentic-backend.onrender.com";

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setReply(data.reply);
    } catch (e) {
      setError("Chat failed. Please try again.");
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
          placeholder="Ask something..."
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
    background: "#0f172a",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
  card: {
    width: "700px",
    padding: "30px",
    background: "#020617",
    borderRadius: "12px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    marginBottom: "10px",
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

export default App;
