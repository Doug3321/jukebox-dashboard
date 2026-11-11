"""Endpoints HTTP do dashboard (camada de entrada da API)."""
from fastapi import APIRouter, Depends, Query

from app.repositories import get_musica_repository
from app.schemas.dashboard_schema import (
    ArtistaStatDTO, FaixaPopularidadeDTO, GeneroStatDTO,
    ImproprioStatDTO, MusicaTopDTO, ResumoDTO,
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
