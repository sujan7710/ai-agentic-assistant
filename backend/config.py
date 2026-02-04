import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

AI_TIMEOUT = int(os.getenv("AI_TIMEOUT", "60"))

RATE_LIMIT = int(os.getenv("RATE_LIMIT", "30"))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", "60"))

MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", "10"))
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS", "8000"))

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing")
