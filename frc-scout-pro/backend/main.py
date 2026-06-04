"""
FRC REBUILT 2026 — Scout Pro  |  FastAPI backend
Run: uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import tba, scouting, analytics
from routers import auth as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="FRC REBUILT 2026 — Scout Pro API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/api/auth",      tags=["Auth"])
app.include_router(tba.router,         prefix="/api/tba",        tags=["TBA"])
app.include_router(scouting.router,    prefix="/api/scout",      tags=["Scouting"])
app.include_router(analytics.router,   prefix="/api/analytics",  tags=["Analytics"])


@app.get("/")
async def root():
    return {"app": "FRC REBUILT 2026 Scout Pro", "version": "2.0.0", "year": 2026}
