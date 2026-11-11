from dataclasses import dataclass, field


@dataclass
class Musica:
    """Tabela MUSICA + vínculos N:M (INTERPRETA e CLASSIFICA) já resolvidos."""
    id_musica: str
    titulo_musica: str
    duracao_ms: int
    popularidade: int
    dancabilidade: float
    improprio: bool
    id_album: str
    nome_album: str = ""
    artistas: list[str] = field(default_factory=list)
    generos: list[str] = field(default_factory=list)
