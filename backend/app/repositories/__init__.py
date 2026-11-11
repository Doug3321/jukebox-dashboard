from app.core.config import settings
from app.repositories.musica_repository import MusicaRepository


def get_musica_repository() -> MusicaRepository:
    """Fábrica: escolhe a fonte de dados conforme DATA_SOURCE."""
    if settings.DATA_SOURCE == "mysql":
        from app.repositories.mysql_musica_repository import MySQLMusicaRepository
        return MySQLMusicaRepository()
    from app.repositories.csv_musica_repository import CsvMusicaRepository
    return CsvMusicaRepository.instance(settings.CSV_PATH)
