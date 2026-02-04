from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import time
from collections import defaultdict

from config import (
    GEMINI_API_KEY,
    AI_TIMEOUT,
    RATE_LIMIT,
    RATE_WINDOW,
    MAX_HISTORY_MESSAGES,
    MAX_PROMPT_CHARS,
)

# ---------------- APP ----------------
app = FastAPI(title="AI Agentic Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # safe for demo
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------
class ChatRequest(BaseModel):
    message: str

# ---------------- RATE LIMIT ----------------
client_requests = defaultdict(list)

def check_rate_limit(ip: str):
    now = time.time()
    client_requests[ip] = [t for t in client_requests[ip] if now - t < RATE_WINDOW]
    if len(client_requests[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    client_requests[ip].append(now)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    check_rate_limit(request.client.host)
    return await call_next(request)

# ---------------- GEMINI CALL ----------------
def call_gemini(prompt: str) -> str:
    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    )

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ]
    }

    try:
        res = requests.post(url, json=payload, timeout=AI_TIMEOUT)
        res.raise_for_status()
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

# ---------------- ENDPOINTS ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(req: ChatRequest):
    reply = call_gemini(req.message)
    return {"reply": reply}
