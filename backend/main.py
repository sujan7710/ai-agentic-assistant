from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

# ---------------- APP ----------------
app = FastAPI(title="AI Agentic Backend (Groq)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-agentic-frontend.onrender.com",
        "https://ai-agentic-frontend1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- CONFIG ----------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.1-8b-instant"

MAX_HISTORY = 6   # memory depth

# ---------------- MODELS ----------------
class ChatRequest(BaseModel):
    message: str

# ---------------- MEMORY ----------------
conversation_history = []

SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are a senior software engineer and code reviewer. "
        "Explain things clearly, practically, and step-by-step. "
        "When code is provided, analyze architecture, logic, bugs, "
        "and improvements. Keep answers concise but insightful."
    )
}

def trim_history():
    global conversation_history
    if len(conversation_history) > MAX_HISTORY:
        conversation_history = conversation_history[-MAX_HISTORY:]

# ---------------- HEALTH ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------- CHAT ----------------
@app.post("/chat")
def chat(req: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY missing")

    user_message = req.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Empty message")

    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    trim_history()

    payload = {
        "model": MODEL,
        "messages": [SYSTEM_PROMPT] + conversation_history
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            GROQ_URL,
            headers=headers,
            json=payload,
            timeout=60
        )

        if response.status_code != 200:
            raise HTTPException(status_code=503, detail=response.text)

        data = response.json()
        ai_reply = data["choices"][0]["message"]["content"]

        conversation_history.append({
            "role": "assistant",
            "content": ai_reply
        })
        trim_history()

        return {"reply": ai_reply}

    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
