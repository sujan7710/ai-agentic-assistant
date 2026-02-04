import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

AI_TIMEOUT = int(os.getenv("AI_TIMEOUT", 60))

RATE_LIMIT = int(os.getenv("RATE_LIMIT", 30))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", 60))

MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES", 10))
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS", 8000))
