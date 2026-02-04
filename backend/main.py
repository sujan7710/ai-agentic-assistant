from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import time

# ================= CONFIG =================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
AI_TIMEOUT = int(os.getenv("AI_TIMEOUT", "60"))

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

# ================= APP =================
app = FastAPI(title="AI Agentic Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-agentic-frontend.onrender.com",
        "https://ai-agentic-frontend1.onrender.com",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= MODELS =================
class ChatRequest(BaseModel):
    message: str

# ================= HEALTH =================
@app.get("/health")
def health():
    return {"status": "ok"}

# ================= GEMINI CALL =================
def call_gemini(prompt: str) -> str:
    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        response = requests.post(
            GEMINI_URL,
            json=payload,
            timeout=AI_TIMEOUT
        )
        response.raise_for_status()

        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=str(e))

# ================= CHAT =================
@app.post("/chat")
def chat(req: ChatRequest):
    reply = call_gemini(req.message)
    return {"reply": reply}
