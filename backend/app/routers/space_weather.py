"""Space Weather router — NASA DONKI + NeoWs + APOD."""
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.services.nasa_api import (
    sync_space_weather,
    get_solar_events_summary,
    get_asteroids_today,
    get_asteroid_by_id,
    get_apod,
)
from fastapi_cache.decorator import cache

router = APIRouter()


@router.get("/latest")
@cache(expire=300)
def get_latest_space_weather(db: Session = Depends(get_db)):
    """Return the most recently cached space weather snapshot (from NASA DONKI)."""
    snapshot = (
        db.query(models.SpaceWeather)
        .order_by(models.SpaceWeather.fetched_at.desc())
        .first()
    )
    if not snapshot:
        return {"message": "No data yet. Trigger /space-weather/sync to fetch."}
    return snapshot


@router.post("/sync")
def sync_weather(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Manually trigger a space weather data sync from NASA DONKI."""
    background_tasks.add_task(sync_space_weather, db)
    return {"message": "NASA DONKI space weather sync started."}


@router.get("/history")
@cache(expire=300)
def get_weather_history(limit: int = 24, db: Session = Depends(get_db)):
    """Return recent space weather snapshots (latest N)."""
    snapshots = (
        db.query(models.SpaceWeather)
        .order_by(models.SpaceWeather.fetched_at.desc())
        .limit(limit)
        .all()
    )
    return snapshots


@router.get("/solar-events")
@cache(expire=600)
def get_solar_events(days: int = 7):
    """
    Return CME, GST, and Solar Flare events from NASA DONKI
    for the past N days (default 7, max 30).
    """
    days = min(days, 30)
    return get_solar_events_summary(days_back=days)


@router.get("/apod")
@cache(expire=3600)
def astronomy_picture_of_day():
    """Return NASA's Astronomy Picture of the Day."""
    data = get_apod()
    if not data:
        return {"message": "APOD data unavailable — check NASA_API_KEY in .env."}
    return data


@router.get("/apod/gallery")
@cache(expire=3600)
def apod_gallery(count: int = 6):
    """Return N random NASA Astronomy Pictures."""
    count = min(count, 10)
    data = get_apod(count=count)
    return data or []


@router.get("/asteroids")
@cache(expire=1800)
def near_earth_asteroids():
    """Return asteroids approaching Earth in the next 3 days (from NASA NeoWs)."""
    return get_asteroids_today()


@router.get("/asteroids/{asteroid_id}")
def asteroid_detail(asteroid_id: str):
    """Return detailed data for a specific asteroid by NASA ID."""
    data = get_asteroid_by_id(asteroid_id)
    if not data:
        return {"message": f"Asteroid {asteroid_id} not found."}
    return data

