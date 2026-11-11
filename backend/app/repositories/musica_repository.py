"""Interface (contrato) do repositório de músicas.

Qualquer fonte de dados (CSV provisório ou MySQL) deve implementar estes métodos,
assim o Service/Controller não mudam quando o banco for integrado.
"""
from abc import ABC, abstractmethod

from app.entities import Musica


class MusicaRepository(ABC):
    @abstractmethod
    def listar_todas(self) -> list[Musica]:
        ...

    @abstractmethod
    def buscar_por_id(self, id_musica: str) -> Musica | None:
        ...

    # --- CRUD (será implementado na integração com MySQL) ---
    def criar(self, musica: Musica) -> Musica:
        raise NotImplementedError

    def atualizar(self, musica: Musica) -> Musica:
        raise NotImplementedError

    def remover(self, id_musica: str) -> bool:
        raise NotImplementedError
