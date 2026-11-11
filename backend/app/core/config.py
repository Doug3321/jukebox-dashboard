from pathlib import Path
from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parents[2]  # pasta backend


class Settings(BaseSettings):
    APP_NAME: str = "Jukebox API"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # "csv" enquanto o banco não está pronto; trocar para "mysql" na integração
    DATA_SOURCE: str = "csv"
    CSV_PATH: str = str(BACKEND_DIR / "data" / "dataset.csv")

    # MySQL (preenchido pelos colegas do banco via .env)
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "jukebox_db"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"


settings = Settings()
