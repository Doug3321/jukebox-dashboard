"""Repositório PROVISÓRIO: lê o dataset.csv do Kaggle e o normaliza em memória
no mesmo formato do jukebox_db (MUSICA, ARTISTA, ALBUM, GENERO).
Permite desenvolver o dashboard enquanto o MySQL não está pronto.
"""
import csv
from pathlib import Path

from app.entities import Musica
from app.repositories.musica_repository import MusicaRepository


class CsvMusicaRepository(MusicaRepository):
    _instance = None

    @classmethod
    def instance(cls, csv_path: str) -> "CsvMusicaRepository":
        if cls._instance is None:
            cls._instance = cls(csv_path)
        return cls._instance

    def __init__(self, csv_path: str):
        self._musicas: dict[str, Musica] = {}
        self._carregar(Path(csv_path))

    def _carregar(self, path: Path) -> None:
        if not path.exists():
            raise FileNotFoundError(f"dataset.csv não encontrado em {path}")
        with path.open(encoding="utf-8") as f:
            for row in csv.DictReader(f):
                track_id = row["track_id"]
                genero = row["track_genre"].strip().lower()
                existente = self._musicas.get(track_id)
                if existente:
                    # mesma música em vários gêneros -> relacionamento N:M (CLASSIFICA)
                    if genero not in existente.generos:
                        existente.generos.append(genero)
                    continue
                self._musicas[track_id] = Musica(
                    id_musica=track_id,
                    titulo_musica=row["track_name"],
                    duracao_ms=int(float(row["duration_ms"] or 0)),
                    popularidade=int(float(row["popularity"] or 0)),
                    dancabilidade=float(row["danceability"] or 0),
                    improprio=row["explicit"].strip().lower() == "true",
                    id_album=row["album_name"],
                    nome_album=row["album_name"],
                    artistas=[a.strip() for a in row["artists"].split(";") if a.strip()],
                    generos=[genero],
                )

    def listar_todas(self) -> list[Musica]:
        return list(self._musicas.values())

    def buscar_por_id(self, id_musica: str) -> Musica | None:
        return self._musicas.get(id_musica)
