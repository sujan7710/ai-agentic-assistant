from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests, zipfile, io, os

OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

app = FastAPI(title="AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class RepoRequest(BaseModel):
    repo_url: str

def call_ai(prompt: str):
    r = requests.post(
        OLLAMA_URL,
        json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()["response"]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(req: ChatRequest):
    return {"reply": call_ai(req.message)}

@app.post("/explain-file")
async def explain_file(files: List[UploadFile] = File(...)):
    text = ""
    for f in files:
        text += (await f.read()).decode("utf-8", errors="ignore")
    return {"analysis": call_ai(text)}

def fetch_repo(repo_url: str):
    zip_url = repo_url.rstrip("/") + "/archive/refs/heads/main.zip"
    r = requests.get(zip_url, timeout=60)
    z = zipfile.ZipFile(io.BytesIO(r.content))
    return "\n".join(
        z.read(n).decode("utf-8", errors="ignore")
        for n in z.namelist()
        if n.endswith((".py", ".js", ".jsx"))
    )

@app.post("/full-code-review")
def review(req: RepoRequest):
    return {"full_code_review": call_ai(fetch_repo(req.repo_url))}
