from app.core.config import settings
from app.repositories.musica_repository import MusicaRepository


def get_musica_repository() -> MusicaRepository:
    """Retorna o repositório MySQL como principal."""
    if settings.DATA_SOURCE == "mysql":
        from app.repositories.mysql_musica_repository import get_mysql_repository
        return get_mysql_repository()

    from app.repositories.csv_musica_repository import CsvMusicaRepository
    return CsvMusicaRepository.instance(settings.CSV_PATH)
