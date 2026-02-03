import { useState } from "react";

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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("Chat failed");
      }

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      setError("Chat failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Code Review Dashboard</h1>

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
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui",
  },
  card: {
    width: "800px",
    maxWidth: "90%",
    background: "#020617",
    borderRadius: "14px",
    padding: "30px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  },
  title: {
    textAlign: "center",
    color: "white",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    minHeight: "160px",
    background: "#020617",
    color: "white",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "15px",
  },
  button: {
    marginTop: "15px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  reply: {
    marginTop: "20px",
    background: "#020617",
    color: "#e5e7eb",
    padding: "15px",
    borderRadius: "10px",
    whiteSpace: "pre-wrap",
  },
  error: {
    color: "#ef4444",
    marginTop: "10px",
  },
};

export default App;
