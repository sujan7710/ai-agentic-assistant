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
    <div style={styles.container}>
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

      {reply && (
        <div style={styles.replyBox}>
          <strong>AI Reply:</strong>
          <p>{reply}</p>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "60px auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#0b1220",
    color: "#fff",
    borderRadius: "12px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    height: "150px",
    padding: "12px",
    fontSize: "16px",
    background: "#111827",
    color: "#fff",
    border: "1px solid #374151",
    borderRadius: "8px",
  },
  button: {
    marginTop: "12px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  replyBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#020617",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },
  error: {
    marginTop: "10px",
    color: "#f87171",
  },
};

export default App;
