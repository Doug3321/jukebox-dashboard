"""Repositório MySQL (jukebox_db) — esqueleto para a integração.

Quando o banco estiver pronto: preencher as queries abaixo e definir
DATA_SOURCE=mysql no .env. Nada mais precisa mudar em services/controllers.
"""
from sqlalchemy import text

from app.database.connection import get_engine
from app.entities import Musica
from app.repositories.musica_repository import MusicaRepository

SQL_LISTAR = text("""
    SELECT m.id_musica, m.titulo_musica, m.duracao_ms, m.popularidade,
           m.dancabilidade, m.improprio, a.id_album, a.nome_album,
           GROUP_CONCAT(DISTINCT ar.nome_artista SEPARATOR ';') AS artistas,
           GROUP_CONCAT(DISTINCT g.nome_genero SEPARATOR ';')  AS generos
    FROM musica m
    JOIN album a           ON a.id_album = m.id_album
    LEFT JOIN interpreta i ON i.id_musica = m.id_musica
    LEFT JOIN artista ar   ON ar.id_artista = i.id_artista
    LEFT JOIN classifica c ON c.id_musica = m.id_musica
    LEFT JOIN genero g     ON g.id_genero = c.id_genero
    GROUP BY m.id_musica, a.id_album
""")


class MySQLMusicaRepository(MusicaRepository):
    def _map(self, r) -> Musica:
        return Musica(
            id_musica=r.id_musica,
            titulo_musica=r.titulo_musica,
            duracao_ms=r.duracao_ms,
            popularidade=r.popularidade,
            dancabilidade=r.dancabilidade,
            improprio=bool(r.improprio),
            id_album=r.id_album,
            nome_album=r.nome_album,
            artistas=(r.artistas or "").split(";") if r.artistas else [],
            generos=(r.generos or "").split(";") if r.generos else [],
        )

    def listar_todas(self) -> list[Musica]:
        with get_engine().connect() as conn:
            return [self._map(r) for r in conn.execute(SQL_LISTAR)]

    def buscar_por_id(self, id_musica: str) -> Musica | None:
        return next((m for m in self.listar_todas() if m.id_musica == id_musica), None)

    # TODO (integração): criar / atualizar / remover com INSERT, UPDATE, DELETE
