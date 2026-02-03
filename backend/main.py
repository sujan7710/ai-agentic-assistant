from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests
import zipfile
import io
import logging
import time
from collections import defaultdict

from config import (
    OLLAMA_URL,
    OLLAMA_MODEL,
    AI_TIMEOUT,
    RATE_LIMIT,
    RATE_WINDOW,
    MAX_HISTORY_MESSAGES,
    MAX_CODE_CHARS,
    MAX_PROMPT_CHARS,
    ENVIRONMENT
)

# ===================== LOGGING =====================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info(f"Starting application in {ENVIRONMENT} mode")

# ===================== APP =====================
app = FastAPI(title="AI Code Review Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== MODELS =====================
class ChatRequest(BaseModel):
    message: str

class RepoRequest(BaseModel):
    repo_url: str

# ===================== PROMPTS =====================
MENTOR_PROMPT = "You are a friendly senior software engineer. Explain simply.\n"
ARCH_PROMPT = "Explain architecture and execution flow in simple words.\n"
QUALITY_PROMPT = "Review code quality and suggest improvements.\n"
REVIEW_PROMPT = """
Perform a professional code review.

Format as:
BUGS / RISKS:
CODE SMELLS:
IMPROVEMENTS:
GOOD PRACTICES:
"""

# ===================== MEMORY =====================
conversation_history = []

def trim_conversation():
    global conversation_history
    conversation_history = conversation_history[-MAX_HISTORY_MESSAGES:]

def trim_text(text: str, limit: int):
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n# --- TRUNCATED FOR PERFORMANCE ---"

# ===================== RATE LIMIT =====================
client_requests = defaultdict(list)

def check_rate_limit(ip: str):
    now = time.time()
    client_requests[ip] = [t for t in client_requests[ip] if now - t < RATE_WINDOW]
    if len(client_requests[ip]) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    client_requests[ip].append(now)

# ===================== MIDDLEWARE =====================
@app.middleware("http")
async def request_logger(request: Request, call_next):
    check_rate_limit(request.client.host)
    start = time.time()
    response = await call_next(request)
    logger.info(
        f"{request.method} {request.url.path} | "
        f"Status {response.status_code} | "
        f"Time {round(time.time() - start, 3)}s"
    )
    return response

# ===================== AI CALL =====================
def call_ollama(prompt: str):
    prompt = trim_text(prompt, MAX_PROMPT_CHARS)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=AI_TIMEOUT
        )
        response.raise_for_status()
        return response.json()["response"]

    except requests.exceptions.Timeout:
        logger.error("AI timeout")
        raise HTTPException(status_code=504, detail="AI timeout")

    except requests.exceptions.RequestException:
        logger.error("AI unavailable")
        raise HTTPException(status_code=503, detail="AI unavailable")

# ===================== HEALTH =====================
@app.get("/health")
def health():
    return {"status": "ok"}

# ===================== HOME =====================
@app.get("/")
def home():
    return {"message": "Production-ready AI Backend is running"}

# ===================== CHAT =====================
@app.post("/chat")
def chat(req: ChatRequest):
    conversation_history.append(f"User: {req.message}")
    trim_conversation()

    prompt = MENTOR_PROMPT + "\n".join(conversation_history) + "\nAI:"
    reply = call_ollama(prompt)

    conversation_history.append(f"AI: {reply}")
    trim_conversation()

    return {"reply": reply}

# ===================== FILE EXPLANATION =====================
@app.post("/explain-file")
async def explain_files(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    combined = ""
    for file in files:
        content = await file.read()
        combined += f"\n\n--- File: {file.filename} ---\n"
        combined += content.decode("utf-8", errors="ignore")

    analysis = call_ollama(f"Explain the following code files:\n{combined}")
    return {"analysis": analysis}

# ===================== PROJECT ANALYSIS =====================
@app.post("/analyze-project")
async def analyze_project(files: List[UploadFile] = File(...)):
    combined = ""
    for file in files:
        combined += f"\n\nFILE: {file.filename}\n"
        combined += (await file.read()).decode("utf-8", errors="ignore")

    return {"analysis": call_ollama(trim_text(combined, MAX_CODE_CHARS))}

# ===================== GITHUB FETCH =====================
def fetch_repo_code(repo_url: str):
    zip_url = repo_url.rstrip("/") + "/archive/refs/heads/main.zip"
    response = requests.get(zip_url, timeout=AI_TIMEOUT)
    response.raise_for_status()

    zip_file = zipfile.ZipFile(io.BytesIO(response.content))
    combined = ""

    for name in zip_file.namelist():
        if name.endswith(".py"):
            combined += f"\n\nFILE: {name}\n"
            combined += zip_file.read(name).decode("utf-8", errors="ignore")

    return trim_text(combined, MAX_CODE_CHARS)

# ===================== GITHUB ENDPOINTS =====================
@app.post("/analyze-github")
def analyze_github(req: RepoRequest):
    return {"analysis": call_ollama(fetch_repo_code(req.repo_url))}

@app.post("/analyze-architecture")
def analyze_architecture(req: RepoRequest):
    return {"architecture": call_ollama(ARCH_PROMPT + fetch_repo_code(req.repo_url))}

@app.post("/analyze-code-quality")
def analyze_code_quality(req: RepoRequest):
    return {"code_quality": call_ollama(QUALITY_PROMPT + fetch_repo_code(req.repo_url))}

@app.post("/full-code-review")
def full_code_review(req: RepoRequest):
    return {"full_code_review": call_ollama(REVIEW_PROMPT + fetch_repo_code(req.repo_url))}
