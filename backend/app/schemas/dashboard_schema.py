"""DTOs (contratos JSON) trocados entre backend e frontend."""
from typing import Any
from pydantic import BaseModel


class ResumoDTO(BaseModel):
    total_musicas: int
    total_artistas: int
    total_albuns: int
    total_generos: int
    popularidade_media: float
    dancabilidade_media: float
    duracao_media_min: float
    percentual_improprio: float


class MusicaTopDTO(BaseModel):
    id_musica: str
    titulo_musica: str
    artistas: list[str]
    nome_album: str
    generos: list[str]
    popularidade: int
    dancabilidade: float
    duracao_min: float
    improprio: bool


class GeneroStatDTO(BaseModel):
    genero: str
    total_musicas: int
    popularidade_media: float
    dancabilidade_media: float


class ArtistaStatDTO(BaseModel):
    artista: str
    total_musicas: int
    popularidade_media: float


class ImproprioStatDTO(BaseModel):
    classificacao: str
    total_musicas: int
    popularidade_media: float
    dancabilidade_media: float


class FaixaPopularidadeDTO(BaseModel):
    faixa: str
    total_musicas: int


# ============================================================================
# DTOs para Consulta de Cantores e Operações CRUD
# ============================================================================

class AlbumSucessoDTO(BaseModel):
    nome_album: str
    total_musicas: int
    popularidade_media: float


class CantorDetalheDTO(BaseModel):
    nome_artista: str
    total_musicas: int
    popularidade_media: float
    dancabilidade_media: float
    generos: list[str]
    musicas: list[MusicaTopDTO]
    albuns_sucesso: list[AlbumSucessoDTO]


class CriarMusicaDTO(BaseModel):
    titulo_musica: str
    artista: str
    album: str
    genero: str
    duracao_min: float = 3.5
    popularidade: int = 50
    dancabilidade: float = 0.5
    improprio: bool = False


class AtualizarItemDTO(BaseModel):
    tipo: str  # "musica", "artista" ou "album"
    identificador: str  # id_musica ou nome atual do artista/álbum
    novo_nome: str


class RespostaCrudDTO(BaseModel):
    sucesso: bool
    mensagem: str
    sql_executado: str
    dados: Any = None
