"""Regras de negócio / agregações do dashboard (COUNT, AVG, MAX, MIN, SUM)."""
from collections import defaultdict
from statistics import mean

from app.repositories.musica_repository import MusicaRepository
from app.schemas.dashboard_schema import (
    ArtistaStatDTO, FaixaPopularidadeDTO, GeneroStatDTO,
    ImproprioStatDTO, MusicaTopDTO, ResumoDTO,
)


def _r(v: float, n: int = 2) -> float:
    return round(v, n)


class DashboardService:
    def __init__(self, repo: MusicaRepository):
        self.repo = repo

    def _filtrar(self, genero: str | None):
        musicas = self.repo.listar_todas()
        if genero:
            musicas = [m for m in musicas if genero.lower() in m.generos]
        return musicas

    def resumo(self, genero: str | None = None) -> ResumoDTO:
        ms = self._filtrar(genero)
        if not ms:
            return ResumoDTO(total_musicas=0, total_artistas=0, total_albuns=0, total_generos=0,
                             popularidade_media=0, dancabilidade_media=0,
                             duracao_media_min=0, percentual_improprio=0)
        return ResumoDTO(
            total_musicas=len(ms),
            total_artistas=len({a for m in ms for a in m.artistas}),
            total_albuns=len({m.id_album for m in ms}),
            total_generos=len({g for m in ms for g in m.generos}),
            popularidade_media=_r(mean(m.popularidade for m in ms)),
            dancabilidade_media=_r(mean(m.dancabilidade for m in ms), 3),
            duracao_media_min=_r(mean(m.duracao_ms for m in ms) / 60000),
            percentual_improprio=_r(100 * sum(m.improprio for m in ms) / len(ms), 1),
        )

    def top_musicas(self, limit: int = 10, genero: str | None = None) -> list[MusicaTopDTO]:
        ms = sorted(self._filtrar(genero), key=lambda m: (-m.popularidade, m.titulo_musica))
        return [
            MusicaTopDTO(
                id_musica=m.id_musica, titulo_musica=m.titulo_musica, artistas=m.artistas,
                nome_album=m.nome_album, generos=m.generos, popularidade=m.popularidade,
                dancabilidade=m.dancabilidade, duracao_min=_r(m.duracao_ms / 60000),
                improprio=m.improprio,
            )
            for m in ms[:limit]
        ]

    def generos(self, limit: int = 10, ordenar_por: str = "total_musicas") -> list[GeneroStatDTO]:
        grupos = defaultdict(list)
        for m in self.repo.listar_todas():
            for g in m.generos:
                grupos[g].append(m)
        stats = [
            GeneroStatDTO(
                genero=g, total_musicas=len(ms),
                popularidade_media=_r(mean(x.popularidade for x in ms)),
                dancabilidade_media=_r(mean(x.dancabilidade for x in ms), 3),
            )
            for g, ms in grupos.items()
        ]
        stats.sort(key=lambda s: getattr(s, ordenar_por, s.total_musicas), reverse=True)
        return stats[:limit]

    def artistas(self, limit: int = 10, genero: str | None = None) -> list[ArtistaStatDTO]:
        grupos = defaultdict(list)
        for m in self._filtrar(genero):
            for a in m.artistas:
                grupos[a].append(m.popularidade)
        stats = [
            ArtistaStatDTO(artista=a, total_musicas=len(p), popularidade_media=_r(mean(p)))
            for a, p in grupos.items()
        ]
        stats.sort(key=lambda s: (s.total_musicas, s.popularidade_media), reverse=True)
        return stats[:limit]

    def improprio(self, genero: str | None = None) -> list[ImproprioStatDTO]:
        grupos = {True: [], False: []}
        for m in self._filtrar(genero):
            grupos[m.improprio].append(m)
        return [
            ImproprioStatDTO(
                classificacao="Explícita" if k else "Livre", total_musicas=len(ms),
                popularidade_media=_r(mean(x.popularidade for x in ms)) if ms else 0,
                dancabilidade_media=_r(mean(x.dancabilidade for x in ms), 3) if ms else 0,
            )
            for k, ms in grupos.items()
        ]

    def faixas_popularidade(self, genero: str | None = None) -> list[FaixaPopularidadeDTO]:
        faixas = [(0, 19), (20, 39), (40, 59), (60, 79), (80, 100)]
        ms = self._filtrar(genero)
        return [
            FaixaPopularidadeDTO(
                faixa=f"{a}-{b}",
                total_musicas=sum(1 for m in ms if a <= m.popularidade <= b),
            )
            for a, b in faixas
        ]

    def lista_generos(self) -> list[str]:
        return sorted({g for m in self.repo.listar_todas() for g in m.generos})
