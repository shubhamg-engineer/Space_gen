from contextlib import asynccontextmanager
import logging
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app import models
from app.routers import (
    auth, satellites, owner, missions, rockets,
    failures, ai_router, analytics, ideas, launches,
    astronauts, space_weather, news, spacex, exoplanets, nextgen,
)
from app.scheduler import start_scheduler, stop_scheduler

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

logger = logging.getLogger("sip.main")

models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)


def _seed_static_data():
    """Seed rockets, failures, and missions from hardcoded data if tables are empty."""
    from app.routers.rockets import SEED_ROCKETS
    from app.routers.failures import SEED_FAILURES
    from app.routers.missions import SEED_MISSIONS

    db = SessionLocal()
    try:
        # Seed Rockets
        if db.query(models.Rocket).count() == 0:
            for r in SEED_ROCKETS:
                db.add(models.Rocket(**r))
            db.commit()
            logger.info(f"[Startup] Seeded {len(SEED_ROCKETS)} rockets.")

        # Seed Failures
        if db.query(models.Failure).count() == 0:
            for f in SEED_FAILURES:
                db.add(models.Failure(**f))
            db.commit()
            logger.info(f"[Startup] Seeded {len(SEED_FAILURES)} failure records.")

        # Seed Missions
        if db.query(models.Mission).count() == 0:
            for m in SEED_MISSIONS:
                db.add(models.Mission(**m))
            db.commit()
            logger.info(f"[Startup] Seeded {len(SEED_MISSIONS)} missions.")

    except Exception as e:
        logger.error(f"[Startup] Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()


def _run_live_syncs():
    """Run live API syncs in a background thread on startup so app has fresh data."""
    from app.services import news_rss, launch_library, spacex_api
    from app.scheduler import sync_astronauts_job

    db = SessionLocal()
    try:
        # Sync SpaceX rockets (updates/supplements seed data)
        try:
            count = spacex_api.sync_spacex_rockets(db)
            logger.info(f"[Startup] SpaceX rockets synced: {count}")
        except Exception as e:
            logger.warning(f"[Startup] SpaceX rocket sync skipped: {e}")

        # Sync SpaceX failures
        try:
            count = spacex_api.sync_spacex_failures(db)
            logger.info(f"[Startup] SpaceX failures synced: {count}")
        except Exception as e:
            logger.warning(f"[Startup] SpaceX failure sync skipped: {e}")

        # Sync launches from Launch Library 2
        try:
            count = launch_library.sync_upcoming_launches(db)
            logger.info(f"[Startup] Launches synced: {count}")
        except Exception as e:
            logger.warning(f"[Startup] Launch sync skipped: {e}")

        # Sync latest space news
        try:
            count = news_rss.sync_news(db)
            logger.info(f"[Startup] News synced: {count} articles")
        except Exception as e:
            logger.warning(f"[Startup] News sync skipped: {e}")

    finally:
        db.close()

    # Astronaut sync (uses its own session internally)
    try:
        sync_astronauts_job()
    except Exception as e:
        logger.warning(f"[Startup] Astronaut sync skipped: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

    # 1. Seed static / curated data immediately (synchronous, fast)
    _seed_static_data()

    # 2. Start background scheduler for recurring sync jobs
    start_scheduler()

    # 3. Kick off live API syncs in a background thread (non-blocking)
    threading.Thread(target=_run_live_syncs, daemon=True, name="startup-sync").start()

    yield
    # Shutdown
    stop_scheduler()

app = FastAPI(
    title="Space Intelligence Platform API",
    description="Backend API for SIP — Space Intelligence Platform v2.0",
    version="2.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://space-gen-lyart.vercel.app",
        # Allow any Vercel preview domains if necessary
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

# Owner (JWT-protected)
app.include_router(owner.router, prefix="/api/v1/owner", tags=["owner"])

# Public intelligence modules
app.include_router(satellites.router, prefix="/api/v1/satellites", tags=["satellites"])
app.include_router(missions.router, prefix="/api/v1/missions", tags=["missions"])
app.include_router(rockets.router, prefix="/api/v1/rockets", tags=["rockets"])
app.include_router(failures.router, prefix="/api/v1/failures", tags=["failures"])
app.include_router(launches.router, prefix="/api/v1/launches", tags=["launches"])
app.include_router(astronauts.router, prefix="/api/v1/astronauts", tags=["astronauts"])

# Data & intelligence feeds
app.include_router(news.router, prefix="/api/v1/news", tags=["news"])
app.include_router(space_weather.router, prefix="/api/v1/space-weather", tags=["space-weather"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(ai_router.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(exoplanets.router, prefix="/api/v1/exoplanets", tags=["exoplanets"])

# SpaceX data (rockets, launches, Starlink, capsules)
app.include_router(spacex.router, prefix="/api/v1/spacex", tags=["spacex"])

# Community
app.include_router(ideas.router, prefix="/api/v1/ideas", tags=["ideas"])

# Next-Gen Phase 5
app.include_router(nextgen.router, prefix="/api/v1/nextgen", tags=["nextgen"])


@app.get("/")
def read_root():
    return {
        "message": "Space Intelligence Platform API v2.0",
        "docs": "/docs",
        "modules": [
            "satellites", "missions", "rockets", "failures", "launches",
            "astronauts", "news", "space-weather", "analytics", "ai",
            "spacex", "ideas", "owner", "nextgen",
        ],
    }
