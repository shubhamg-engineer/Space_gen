"""
SpaceX API router — Rockets, Launches, Starlink, Capsules, Launchpads.
No API key required. Powered by the open SpaceX REST API v5.
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import spacex_api
from fastapi_cache.decorator import cache

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Rockets
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/rockets")
@cache(expire=3600)
def list_spacex_rockets():
    """Return all SpaceX rockets with full technical specs."""
    return spacex_api.get_all_rockets()


@router.post("/rockets/sync")
def sync_rockets_to_db(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Sync SpaceX rocket data into the local database (background)."""
    background_tasks.add_task(spacex_api.sync_spacex_rockets, db)
    return {"message": "SpaceX rocket sync started."}


# ─────────────────────────────────────────────────────────────────────────────
# Launches
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/launches/upcoming")
@cache(expire=600)
def upcoming_spacex_launches(limit: int = 10):
    """Return upcoming SpaceX launches (sorted by date)."""
    limit = min(limit, 50)
    return spacex_api.get_upcoming_launches(limit=limit)


@router.get("/launches/past")
@cache(expire=1800)
def past_spacex_launches(limit: int = 20):
    """Return the N most recent past SpaceX launches."""
    limit = min(limit, 100)
    return spacex_api.get_past_launches(limit=limit)


@router.get("/launches/latest")
@cache(expire=300)
def latest_spacex_launch():
    """Return the most recent SpaceX launch."""
    data = spacex_api.get_latest_launch()
    return data or {"message": "No launch data available."}


@router.get("/launches/next")
@cache(expire=300)
def next_spacex_launch():
    """Return the next scheduled SpaceX launch."""
    data = spacex_api.get_next_launch()
    return data or {"message": "No upcoming launch data available."}


# ─────────────────────────────────────────────────────────────────────────────
# Starlink
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/starlink")
@cache(expire=3600)
def starlink_stats():
    """Return Starlink constellation summary statistics."""
    return spacex_api.get_starlink_stats()


# ─────────────────────────────────────────────────────────────────────────────
# Capsules (Dragon)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/capsules")
@cache(expire=3600)
def list_capsules():
    """Return all Dragon capsules and their reuse history."""
    return spacex_api.get_capsules()


# ─────────────────────────────────────────────────────────────────────────────
# Launchpads
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/launchpads")
@cache(expire=86400)
def list_launchpads():
    """Return all SpaceX launchpad details."""
    return spacex_api.get_launchpads()


# ─────────────────────────────────────────────────────────────────────────────
# Failure sync
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/failures/sync")
def sync_spacex_failures(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Sync SpaceX mission failures into the intelligence database."""
    background_tasks.add_task(spacex_api.sync_spacex_failures, db)
    return {"message": "SpaceX failure sync started."}
