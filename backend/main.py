from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, time, logging
from collections import defaultdict

from config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    AI_TIMEOUT,
    RATE_LIMIT,
    RATE_WINDOW,
    MAX_HISTORY_MESSAGES,
    MAX_PROMPT_CHARS,
    ENVIRONMENT
)

# ---------------- LOGGING ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info(f"Backend running in {ENVIRONMENT}")

# ---------------- APP ----------------
app = FastAPI(title="AI Agentic Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-agentic-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELS ----------------
class ChatRequest(BaseModel):
    message: str

# ---------------- MEMORY ----------------
conversation_history = []

def trim_history():
    global conversation_history
    conversation_history = conversation_history[-MAX_HISTORY_MESSAGES:]

# ---------------- RATE LIMIT ----------------
clients = defaultdict(list)

def check_rate_limit(ip):
    now = time.time()
    clients[ip] = [t for t in clients[ip] if now - t < RATE_WINDOW]
    if len(clients[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    clients[ip].append(now)

@app.middleware("http")
async def limiter(request: Request, call_next):
    check_rate_limit(request.client.host)
    return await call_next(request)

# ---------------- GEMINI CALL ----------------
def call_gemini(prompt: str) -> str:
    prompt = prompt[:MAX_PROMPT_CHARS]

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    body = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    try:
        r = requests.post(url, json=body, headers=headers, timeout=AI_TIMEOUT)
        r.raise_for_status()
        return r.json()["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        raise HTTPException(status_code=503, detail="AI unavailable")

# ---------------- ROUTES ----------------
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def home():
    return {"message": "AI Agentic Backend (Gemini) is running"}

@app.post("/chat")
def chat(req: ChatRequest):
    conversation_history.append(f"User: {req.message}")
    trim_history()

    prompt = (
        "You are a helpful senior software engineer.\n\n" +
        "\n".join(conversation_history) +
        "\nAI:"
    )

    reply = call_gemini(prompt)

    conversation_history.append(f"AI: {reply}")
    trim_history()

    return {"reply": reply}
