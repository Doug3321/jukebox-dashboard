"""Interface (contrato) do repositório de músicas."""
from abc import ABC, abstractmethod
from app.entities import Musica


class MusicaRepository(ABC):
    @abstractmethod
    def listar_todas(self) -> list[Musica]:
        ...

    @abstractmethod
    def buscar_por_id(self, id_musica: str) -> Musica | None:
        ...

    @abstractmethod
    def criar(self, musica: Musica) -> Musica:
        ...

    @abstractmethod
    def atualizar_musica(self, id_musica: str, novo_titulo: str) -> bool:
        ...

    @abstractmethod
    def atualizar_artista(self, nome_antigo: str, novo_nome: str) -> int:
        ...

    @abstractmethod
    def atualizar_album(self, nome_antigo: str, novo_nome: str) -> int:
        ...

    @abstractmethod
    def remover(self, id_musica: str) -> bool:
        ...
