import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")
AI_TIMEOUT = int(os.getenv("AI_TIMEOUT"))

RATE_LIMIT = int(os.getenv("RATE_LIMIT"))
RATE_WINDOW = int(os.getenv("RATE_WINDOW"))

MAX_HISTORY_MESSAGES = int(os.getenv("MAX_HISTORY_MESSAGES"))
MAX_CODE_CHARS = int(os.getenv("MAX_CODE_CHARS"))
MAX_PROMPT_CHARS = int(os.getenv("MAX_PROMPT_CHARS"))

ENVIRONMENT = os.getenv("ENVIRONMENT")
