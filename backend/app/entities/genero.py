from dataclasses import dataclass


@dataclass
class Genero:
    """Tabela GENERO (nome_genero é UNIQUE)."""
    id_genero: str
    nome_genero: str
