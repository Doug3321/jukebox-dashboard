"""Conexão com o MySQL (jukebox_db).

Ainda NÃO está em uso: será ativada quando o banco dos colegas estiver pronto
(DATA_SOURCE=mysql no .env).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

_engine = None
_SessionLocal = None


def get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        _engine = create_engine(settings.database_url, pool_pre_ping=True)
        _SessionLocal = sessionmaker(bind=_engine, autoflush=False)
    return _engine


def get_session():
    get_engine()
    session = _SessionLocal()
    try:
        yield session
    finally:
        session.close()
