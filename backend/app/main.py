from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.dashboard_controller import router as dashboard_router
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix=settings.API_PREFIX)


@app.get("/health")
def health():
    return {"status": "ok", "data_source": settings.DATA_SOURCE}
