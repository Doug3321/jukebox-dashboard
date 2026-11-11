"""Endpoints HTTP do dashboard (camada de entrada da API)."""
from fastapi import APIRouter, Depends, Query

from app.repositories import get_musica_repository
from app.schemas.dashboard_schema import (
    ArtistaStatDTO, AtualizarItemDTO, CantorDetalheDTO, CriarMusicaDTO,
    FaixaPopularidadeDTO, GeneroStatDTO, ImproprioStatDTO, MusicaTopDTO,
    RespostaCrudDTO, ResumoDTO,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_service() -> DashboardService:
    return DashboardService(get_musica_repository())


@router.get("/resumo", response_model=ResumoDTO)
def resumo(genero: str | None = None, svc: DashboardService = Depends(get_service)):
    return svc.resumo(genero)


@router.get("/top-musicas", response_model=list[MusicaTopDTO])
def top_musicas(limit: int = Query(10, ge=1, le=100), genero: str | None = None,
                svc: DashboardService = Depends(get_service)):
    return svc.top_musicas(limit, genero)


@router.get("/generos", response_model=list[GeneroStatDTO])
def generos(limit: int = Query(10, ge=1, le=200),
            ordenar_por: str = Query("total_musicas",
                                     pattern="^(total_musicas|popularidade_media|dancabilidade_media)$"),
            svc: DashboardService = Depends(get_service)):
    return svc.generos(limit, ordenar_por)


@router.get("/artistas", response_model=list[ArtistaStatDTO])
def artistas(limit: int = Query(10, ge=1, le=100), genero: str | None = None,
             svc: DashboardService = Depends(get_service)):
    return svc.artistas(limit, genero)


@router.get("/improprio", response_model=list[ImproprioStatDTO])
def improprio(genero: str | None = None, svc: DashboardService = Depends(get_service)):
    return svc.improprio(genero)


@router.get("/faixas-popularidade", response_model=list[FaixaPopularidadeDTO])
def faixas_popularidade(genero: str | None = None, svc: DashboardService = Depends(get_service)):
    return svc.faixas_popularidade(genero)


@router.get("/lista-generos", response_model=list[str])
def lista_generos(svc: DashboardService = Depends(get_service)):
    return svc.lista_generos()


# ============================================================================
# Endpoints do Cantor (Select de Cantores + Músicas + Álbuns de Maior Sucesso)
# ============================================================================

@router.get("/cantores/lista", response_model=list[str])
def listar_cantores(limit: int = Query(150, ge=1, le=500), svc: DashboardService = Depends(get_service)):
    return svc.listar_cantores(limit)


@router.get("/cantores/detalhe", response_model=CantorDetalheDTO)
def detalhar_cantor(nome_artista: str = Query(..., description="Nome do cantor a pesquisar"),
                    svc: DashboardService = Depends(get_service)):
    return svc.detalhar_cantor(nome_artista)


# ============================================================================
# Endpoints de Manipulação de Dados (CRUD: Insert, Update, Delete)
# ============================================================================

@router.post("/musicas", response_model=RespostaCrudDTO)
def criar_musica(dados: CriarMusicaDTO, svc: DashboardService = Depends(get_service)):
    return svc.criar_musica(dados)


@router.put("/atualizar", response_model=RespostaCrudDTO)
def atualizar_item(dados: AtualizarItemDTO, svc: DashboardService = Depends(get_service)):
    return svc.atualizar_item(dados)


@router.delete("/musicas/{id_musica}", response_model=RespostaCrudDTO)
def deletar_musica(id_musica: str, svc: DashboardService = Depends(get_service)):
    return svc.deletar_musica(id_musica)
