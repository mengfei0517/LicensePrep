import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Centralized application settings."""
    APP_NAME: str = os.getenv("APP_NAME", "LicensePrep")
    FLASK_TEMPLATE_FOLDER: str = os.getenv("FLASK_TEMPLATE_FOLDER", os.path.join("web", "templates"))
    FLASK_STATIC_FOLDER: str = os.getenv("FLASK_STATIC_FOLDER", os.path.join("web", "static"))

    # Google Gemini API (Cloud-based AI)
    GOOGLE_GEMINI_API_KEY: str = os.getenv("GOOGLE_GEMINI_API_KEY", "AIzaSyBpB5EzrxJ1-Py5rK5NsdmE1Grrlc0ln6o")

    # AWS settings
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")

settings = Settings()
