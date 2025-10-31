import os
from typing import List

try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    load_dotenv = None


def _load_env_file_fallback() -> None:
    """Fallback loader for .env when python-dotenv is missing."""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    dotenv_path = os.path.join(project_root, ".env")
    if not os.path.exists(dotenv_path):
        return
    try:
        with open(dotenv_path, "r", encoding="utf-8") as env_file:
            for line in env_file:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        pass


if load_dotenv is not None:
    load_dotenv()
else:  # pragma: no cover
    _load_env_file_fallback()


def _parse_csv_env(value: str | None, default: List[str]) -> List[str]:
    """Convert comma-separated env values into a clean string list."""
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    """Centralized application settings."""

    APP_NAME: str = os.getenv("APP_NAME", "LicensePrep")
    FLASK_TEMPLATE_FOLDER: str = os.getenv(
        "FLASK_TEMPLATE_FOLDER", os.path.join("web", "templates")
    )
    FLASK_STATIC_FOLDER: str = os.getenv(
        "FLASK_STATIC_FOLDER", os.path.join("web", "static")
    )

    # Google Gemini API (Cloud-based AI)
    # Support legacy GOOGLE_API_KEY env for backwards compatibility.
    GOOGLE_GEMINI_API_KEY: str = os.getenv(
        "GOOGLE_GEMINI_API_KEY",
        os.getenv("GOOGLE_API_KEY", ""),
    )

    # Flask server configuration
    FLASK_HOST: str = os.getenv("FLASK_HOST", "0.0.0.0")
    FLASK_PORT: int = int(os.getenv("FLASK_PORT", "5000"))
    CORS_ALLOWED_ORIGINS: List[str] = _parse_csv_env(
        os.getenv("CORS_ALLOWED_ORIGINS"),
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://localhost:19000",
            "http://127.0.0.1:19000",
        ],
    )

    # AWS settings
    AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")

    # Google Maps API
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")


settings = Settings()
