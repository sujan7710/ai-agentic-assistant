import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setReply("");

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      console.error(err);
      setError("Chat failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>AI Code Review Dashboard</h1>

        <textarea
          style={styles.textarea}
          placeholder="Ask something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button style={styles.button} onClick={sendMessage} disabled={loading}>
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
    background: "linear-gradient(135deg, #020617, #020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#020617",
    borderRadius: "14px",
    padding: "30px",
    width: "700px",
    color: "#fff",
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    minHeight: "140px",
    padding: "12px",
    background: "#020617",
    color: "#fff",
    border: "1px solid #1e293b",
    borderRadius: "8px",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  reply: {
    marginTop: "20px",
    background: "#020617",
    padding: "15px",
    borderRadius: "8px",
    whiteSpace: "pre-wrap",
  },
  error: {
    marginTop: "10px",
    color: "#ef4444",
  },
};

export default App;
