"""Repositório MySQL (jukebox) — Conexão direta com o Banco de Dados Relacional.
"""
from collections import defaultdict
import uuid
from sqlalchemy import text

from app.database.connection import get_engine
from app.entities import Musica
from app.repositories.musica_repository import MusicaRepository


class MySQLMusicaRepository(MusicaRepository):
    def __init__(self):
        self._cache: list[Musica] | None = None

    def limpar_cache(self):
        self._cache = None

    def listar_todas(self) -> list[Musica]:
        if self._cache is not None:
            return self._cache

        with get_engine().connect() as conn:
            # 1. Dicionário de Álbuns
            albuns: dict[str, str] = {}
            for r in conn.execute(text("SELECT id_album, nome_album FROM album")):
                albuns[str(r[0])] = str(r[1])

            # 2. Dicionário de Artistas
            artistas: dict[str, str] = {}
            for r in conn.execute(text("SELECT id_artista, nome_artista FROM artista")):
                artistas[str(r[0])] = str(r[1])

            # 3. Dicionário de Gêneros
            generos: dict[str, str] = {}
            for r in conn.execute(text("SELECT id_genero, nome_genero FROM genero")):
                generos[str(r[0])] = str(r[1])

            # 4. Relação INTERPRETA (Música -> Lista de Nomes de Artistas)
            interpreta = defaultdict(list)
            for r in conn.execute(text("SELECT id_musica, id_artista FROM interpreta")):
                id_mus = str(r[0])
                id_art = str(r[1])
                if id_art in artistas:
                    interpreta[id_mus].append(artistas[id_art])

            # 5. Relação CLASSIFICA (Música -> Lista de Nomes de Gêneros)
            classifica = defaultdict(list)
            for r in conn.execute(text("SELECT id_musica, id_genero FROM classifica")):
                id_mus = str(r[0])
                id_gen = str(r[1])
                if id_gen in generos:
                    classifica[id_mus].append(generos[id_gen])

            # 6. Tabela principal MUSICA
            musicas: list[Musica] = []
            res_musicas = conn.execute(
                text("""
                    SELECT id_musica, titulo_musica, duracao_ms, popularidade,
                           dancabilidade, improprio, id_album
                    FROM musica
                """)
            )

            for r in res_musicas:
                id_m = str(r[0])
                id_alb = str(r[6] or "")
                musicas.append(
                    Musica(
                        id_musica=id_m,
                        titulo_musica=str(r[1]),
                        duracao_ms=int(r[2] or 0),
                        popularidade=int(r[3] or 0),
                        dancabilidade=float(r[4] or 0.0),
                        improprio=bool(r[5]),
                        id_album=id_alb,
                        nome_album=albuns.get(id_alb, ""),
                        artistas=interpreta.get(id_m, []),
                        generos=classifica.get(id_m, []),
                    )
                )

        self._cache = musicas
        return self._cache

    def buscar_por_id(self, id_musica: str) -> Musica | None:
        for m in self.listar_todas():
            if m.id_musica == id_musica:
                return m
        return None

    def criar(self, musica: Musica) -> Musica:
        with get_engine().begin() as conn:
            # 1. Garantir que o álbum exista
            if musica.id_album and musica.nome_album:
                conn.execute(
                    text("INSERT IGNORE INTO album (id_album, nome_album) VALUES (:id_album, :nome_album)"),
                    {"id_album": musica.id_album, "nome_album": musica.nome_album}
                )

            # 2. Inserir na tabela MUSICA
            conn.execute(
                text("""
                    INSERT INTO musica (id_musica, titulo_musica, duracao_ms, popularidade, dancabilidade, improprio, id_album)
                    VALUES (:id_musica, :titulo_musica, :duracao_ms, :popularidade, :dancabilidade, :improprio, :id_album)
                """),
                {
                    "id_musica": musica.id_musica,
                    "titulo_musica": musica.titulo_musica,
                    "duracao_ms": musica.duracao_ms,
                    "popularidade": musica.popularidade,
                    "dancabilidade": musica.dancabilidade,
                    "improprio": 1 if musica.improprio else 0,
                    "id_album": musica.id_album,
                }
            )

            # 3. Artistas e relação INTERPRETA
            for nome_ar in musica.artistas:
                nome_limpo = nome_ar.strip()
                if not nome_limpo:
                    continue
                res = conn.execute(
                    text("SELECT id_artista FROM artista WHERE nome_artista = :nome LIMIT 1"),
                    {"nome": nome_limpo}
                ).fetchone()
                if res:
                    id_art = res[0]
                else:
                    id_art = str(uuid.uuid4())
                    conn.execute(
                        text("INSERT INTO artista (id_artista, nome_artista) VALUES (:id, :nome)"),
                        {"id": id_art, "nome": nome_limpo}
                    )
                conn.execute(
                    text("INSERT IGNORE INTO interpreta (id_musica, id_artista) VALUES (:id_m, :id_a)"),
                    {"id_m": musica.id_musica, "id_a": id_art}
                )

            # 4. Gêneros e relação CLASSIFICA
            for nome_gen in musica.generos:
                gen_limpo = nome_gen.strip().lower()
                if not gen_limpo:
                    continue
                res = conn.execute(
                    text("SELECT id_genero FROM genero WHERE LOWER(nome_genero) = :nome LIMIT 1"),
                    {"nome": gen_limpo}
                ).fetchone()
                if res:
                    id_gen = res[0]
                else:
                    id_gen = str(uuid.uuid4())
                    conn.execute(
                        text("INSERT INTO genero (id_genero, nome_genero) VALUES (:id, :nome)"),
                        {"id": id_gen, "nome": gen_limpo}
                    )
                conn.execute(
                    text("INSERT IGNORE INTO classifica (id_musica, id_genero) VALUES (:id_m, :id_g)"),
                    {"id_m": musica.id_musica, "id_g": id_gen}
                )

        self.limpar_cache()
        return musica

    def atualizar_musica(self, id_musica: str, novo_titulo: str) -> bool:
        with get_engine().begin() as conn:
            res = conn.execute(
                text("UPDATE musica SET titulo_musica = :novo WHERE id_musica = :id"),
                {"novo": novo_titulo, "id": id_musica}
            )
            modificado = res.rowcount > 0

        if modificado:
            self.limpar_cache()
        return modificado

    def atualizar_artista(self, nome_antigo: str, novo_nome: str) -> int:
        with get_engine().begin() as conn:
            res = conn.execute(
                text("UPDATE artista SET nome_artista = :novo WHERE nome_artista = :antigo"),
                {"novo": novo_nome, "antigo": nome_antigo}
            )
            linhas = res.rowcount

        if linhas > 0:
            self.limpar_cache()
        return linhas

    def atualizar_album(self, nome_antigo: str, novo_nome: str) -> int:
        with get_engine().begin() as conn:
            res = conn.execute(
                text("UPDATE album SET nome_album = :novo WHERE nome_album = :antigo"),
                {"novo": novo_nome, "antigo": nome_antigo}
            )
            linhas = res.rowcount

        if linhas > 0:
            self.limpar_cache()
        return linhas

    def remover(self, id_musica: str) -> bool:
        with get_engine().begin() as conn:
            conn.execute(text("DELETE FROM classifica WHERE id_musica = :id"), {"id": id_musica})
            conn.execute(text("DELETE FROM interpreta WHERE id_musica = :id"), {"id": id_musica})
            res = conn.execute(text("DELETE FROM musica WHERE id_musica = :id"), {"id": id_musica})
            removido = res.rowcount > 0

        if removido:
            self.limpar_cache()
        return removido


_mysql_instance: MySQLMusicaRepository | None = None


def get_mysql_repository() -> MySQLMusicaRepository:
    global _mysql_instance
    if _mysql_instance is None:
        _mysql_instance = MySQLMusicaRepository()
    return _mysql_instance
