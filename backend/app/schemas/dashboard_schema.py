"""DTOs (contratos JSON) trocados entre backend e frontend."""
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
