import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Centralized application settings."""
    APP_NAME: str = os.getenv("APP_NAME", "LicensePrep")
    FLASK_TEMPLATE_FOLDER: str = os.getenv("FLASK_TEMPLATE_FOLDER", os.path.join("web", "templates"))
    FLASK_STATIC_FOLDER: str = os.getenv("FLASK_STATIC_FOLDER", os.path.join("web", "static"))

    # Vector store backend: faiss or pgvector
    VECTOR_STORE_BACKEND: str = os.getenv("VECTOR_STORE_BACKEND", "faiss")

    # NVIDIA NIM endpoints
    NIM_LLM_ENDPOINT: str = os.getenv("NIM_LLM_ENDPOINT", "")
    NIM_EMBEDDING_ENDPOINT: str = os.getenv("NIM_EMBEDDING_ENDPOINT", "")
    NIM_API_KEY: str = os.getenv("NIM_API_KEY", "")

    # AWS settings
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")

settings = Settings()
