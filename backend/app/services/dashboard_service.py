"""Regras de negócio / agregações do dashboard (COUNT, AVG, MAX, MIN, SUM) e operações CRUD."""
from collections import defaultdict
from statistics import mean
import uuid

from app.entities import Musica
from app.repositories.musica_repository import MusicaRepository
from app.schemas.dashboard_schema import (
    AlbumSucessoDTO, ArtistaStatDTO, AtualizarItemDTO, CantorDetalheDTO,
    CriarMusicaDTO, FaixaPopularidadeDTO, GeneroStatDTO, ImproprioStatDTO,
    MusicaTopDTO, RespostaCrudDTO, ResumoDTO,
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

    def buscar_musicas(self, termo: str, limit: int = 50) -> list[MusicaTopDTO]:
        t = termo.strip().lower()
        achadas = [
            m for m in self.repo.listar_todas()
            if t in m.titulo_musica.lower()
            or t in m.nome_album.lower()
            or any(t in a.lower() for a in m.artistas)
        ]
        achadas.sort(key=lambda m: (-m.popularidade, m.titulo_musica))
        return [
            MusicaTopDTO(
                id_musica=m.id_musica, titulo_musica=m.titulo_musica, artistas=m.artistas,
                nome_album=m.nome_album, generos=m.generos, popularidade=m.popularidade,
                dancabilidade=m.dancabilidade, duracao_min=_r(m.duracao_ms / 60000),
                improprio=m.improprio,
            )
            for m in achadas[:limit]
        ]

    # =========================================================================
    # Consulta de Cantores (Artistas) e Álbuns de Maior Sucesso
    # =========================================================================

    def listar_cantores(self, limit: int = 150) -> list[str]:
        contagem = defaultdict(int)
        for m in self.repo.listar_todas():
            for a in m.artistas:
                contagem[a] += 1
        ordenados = sorted(contagem.keys(), key=lambda a: contagem[a], reverse=True)
        return ordenados[:limit]

    def detalhar_cantor(self, nome_artista: str) -> CantorDetalheDTO:
        nome_busca = nome_artista.strip().lower()
        musicas_cantor = [
            m for m in self.repo.listar_todas()
            if any(a.strip().lower() == nome_busca for a in m.artistas)
        ]

        if not musicas_cantor:
            return CantorDetalheDTO(
                nome_artista=nome_artista, total_musicas=0,
                popularidade_media=0, dancabilidade_media=0,
                generos=[], musicas=[], albuns_sucesso=[]
            )

        # Agrupamento por Álbum (para listar os de maior sucesso)
        albuns_dict = defaultdict(list)
        for m in musicas_cantor:
            albuns_dict[m.nome_album].append(m)

        albuns_sucesso = [
            AlbumSucessoDTO(
                nome_album=alb,
                total_musicas=len(ms),
                popularidade_media=_r(mean(x.popularidade for x in ms), 1)
            )
            for alb, ms in albuns_dict.items()
        ]
        # Ordenar os álbuns pela maior popularidade média
        albuns_sucesso.sort(key=lambda a: (a.popularidade_media, a.total_musicas), reverse=True)

        # Ordenar as músicas do cantor por popularidade descrescente
        musicas_cantor.sort(key=lambda m: m.popularidade, reverse=True)
        musicas_dto = [
            MusicaTopDTO(
                id_musica=m.id_musica, titulo_musica=m.titulo_musica,
                artistas=m.artistas, nome_album=m.nome_album, generos=m.generos,
                popularidade=m.popularidade, dancabilidade=m.dancabilidade,
                duracao_min=_r(m.duracao_ms / 60000), improprio=m.improprio
            )
            for m in musicas_cantor
        ]

        generos_cantor = sorted({g for m in musicas_cantor for g in m.generos})

        return CantorDetalheDTO(
            nome_artista=nome_artista,
            total_musicas=len(musicas_cantor),
            popularidade_media=_r(mean(m.popularidade for m in musicas_cantor), 1),
            dancabilidade_media=_r(mean(m.dancabilidade for m in musicas_cantor), 3),
            generos=generos_cantor,
            musicas=musicas_dto,
            albuns_sucesso=albuns_sucesso[:10]
        )

    # =========================================================================
    # Operações CRUD (Create, Update, Delete)
    # =========================================================================

    def criar_musica(self, dados: CriarMusicaDTO) -> RespostaCrudDTO:
        novo_id = str(uuid.uuid4())
        duracao_ms = int(dados.duracao_min * 60000)

        nova_musica = Musica(
            id_musica=novo_id,
            titulo_musica=dados.titulo_musica,
            duracao_ms=duracao_ms,
            popularidade=dados.popularidade,
            dancabilidade=dados.dancabilidade,
            improprio=dados.improprio,
            id_album=dados.album,
            nome_album=dados.album,
            artistas=[dados.artista.strip()],
            generos=[dados.genero.strip().lower()],
        )

        self.repo.criar(nova_musica)

        sql_simulado = (
            f"INSERT INTO musica (id_musica, titulo_musica, duracao_ms, popularidade, dancabilidade, improprio, id_album)\n"
            f"VALUES ('{novo_id}', '{dados.titulo_musica}', {duracao_ms}, {dados.popularidade}, {dados.dancabilidade}, {1 if dados.improprio else 0}, '{dados.album}');\n"
            f"INSERT INTO interpreta (id_musica, id_artista) VALUES ('{novo_id}', '{dados.artista}');\n"
            f"INSERT INTO classifica (id_musica, id_genero) VALUES ('{novo_id}', '{dados.genero}');"
        )

        return RespostaCrudDTO(
            sucesso=True,
            mensagem=f"Música '{dados.titulo_musica}' cadastrada com sucesso no catálogo!",
            sql_executado=sql_simulado,
            dados={"id_musica": novo_id, "titulo": dados.titulo_musica}
        )

    def atualizar_item(self, dados: AtualizarItemDTO) -> RespostaCrudDTO:
        tipo = dados.tipo.strip().lower()
        novo = dados.novo_nome.strip()
        alvo = dados.identificador.strip()

        if tipo == "musica":
            ok = self.repo.atualizar_musica(alvo, novo)
            if not ok:
                return RespostaCrudDTO(sucesso=False, mensagem="Música não encontrada.", sql_executado="")
            sql = f"UPDATE musica SET titulo_musica = '{novo}' WHERE id_musica = '{alvo}';"
            msg = f"Nome da música atualizado para '{novo}' com sucesso!"

        elif tipo == "artista":
            qtd = self.repo.atualizar_artista(alvo, novo)
            sql = f"UPDATE artista SET nome_artista = '{novo}' WHERE nome_artista = '{alvo}';"
            msg = f"Nome do artista atualizado de '{alvo}' para '{novo}' em {qtd} músicas!"

        elif tipo == "album":
            qtd = self.repo.atualizar_album(alvo, novo)
            sql = f"UPDATE album SET nome_album = '{novo}' WHERE nome_album = '{alvo}';"
            msg = f"Nome do álbum atualizado de '{alvo}' para '{novo}' em {qtd} faixas!"

        else:
            return RespostaCrudDTO(sucesso=False, mensagem="Tipo inválido. Escolha 'musica', 'artista' ou 'album'.", sql_executado="")

        return RespostaCrudDTO(sucesso=True, mensagem=msg, sql_executado=sql)

    def deletar_musica(self, id_musica: str) -> RespostaCrudDTO:
        musica = self.repo.buscar_por_id(id_musica)
        titulo = musica.titulo_musica if musica else id_musica

        removido = self.repo.remover(id_musica)
        if not removido:
            return RespostaCrudDTO(sucesso=False, mensagem="Música não encontrada no catálogo.", sql_executado="")

        sql_executado = (
            f"DELETE FROM classifica WHERE id_musica = '{id_musica}';\n"
            f"DELETE FROM interpreta WHERE id_musica = '{id_musica}';\n"
            f"DELETE FROM musica WHERE id_musica = '{id_musica}';"
        )

        return RespostaCrudDTO(
            sucesso=True,
            mensagem=f"Música '{titulo}' removida com sucesso!",
            sql_executado=sql_executado
        )
