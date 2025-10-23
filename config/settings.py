import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Centralized application settings."""
    APP_NAME: str = os.getenv("APP_NAME", "LicensePrep")
    FLASK_TEMPLATE_FOLDER: str = os.getenv("FLASK_TEMPLATE_FOLDER", os.path.join("web", "templates"))
    FLASK_STATIC_FOLDER: str = os.getenv("FLASK_STATIC_FOLDER", os.path.join("web", "static"))

    # Google Gemini API (Cloud-based AI)
    # IMPORTANT: Set this in .env file, never commit API keys to git!
    GOOGLE_GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "")

    # AWS settings
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")

settings = Settings()
