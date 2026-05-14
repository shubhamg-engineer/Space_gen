"""Satellites router — full CRUD + TLE ingestion + ISS + filters."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app.services.space_track import fetch_and_store_tle
from app.services.open_notify import get_iss_position
from app.services.groq_ai import generate_explanation
from fastapi_cache.decorator import cache

router = APIRouter()


@router.post("/ingest", tags=["satellites"])
def ingest_satellites(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger background ingestion of active TLEs from Space-Track.org (or CelesTrak fallback)."""
    background_tasks.add_task(fetch_and_store_tle, db)
    return {"message": "TLE ingestion started from Space-Track.org (CelesTrak fallback if unconfigured)."}


@router.get("/", tags=["satellites"])
@cache(expire=300)
def get_satellites(
    skip: int = 0,
    limit: int = Query(default=100, le=500),
    search: Optional[str] = None,
    orbit_type: Optional[str] = None,
    country: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List satellites with optional filters."""
    q = db.query(models.Satellite)
    if search:
        q = q.filter(models.Satellite.name.ilike(f"%{search}%"))
    if orbit_type:
        q = q.filter(models.Satellite.orbit_type.ilike(f"%{orbit_type}%"))
    if country:
        q = q.filter(models.Satellite.country_of_origin.ilike(f"%{country}%"))
    if status:
        q = q.filter(models.Satellite.status.ilike(f"%{status}%"))
    return q.offset(skip).limit(limit).all()


@router.get("/count", tags=["satellites"])
@cache(expire=300)
def get_satellite_count(db: Session = Depends(get_db)):
    return {"count": db.query(models.Satellite).count()}


@router.get("/iss", tags=["satellites"])
@cache(expire=60)
def get_iss_tracker():
    """Return current ISS position and basic telemetry."""
    pos = get_iss_position()
    return {
        "name": "International Space Station",
        "norad_id": 25544,
        "position": pos,
        "altitude_km": pos.get("altitude_km", 408),
        "velocity_km_s": pos.get("velocity_km_s", 7.66),
        "orbital_period_min": 92.68,
        "inclination_deg": 51.6,
    }


@router.get("/debris/stats", tags=["satellites"])
@cache(expire=3600)
def get_debris_stats(db: Session = Depends(get_db)):
    """Return space debris statistics."""
    total = db.query(models.Satellite).count()
    active = db.query(models.Satellite).filter(models.Satellite.status == "Active").count()
    debris = total - active
    return {
        "total_tracked": total,
        "active_satellites": active,
        "estimated_debris": debris,
        "leo_objects": db.query(models.Satellite).filter(
            models.Satellite.orbit_type.ilike("%LEO%")).count(),
        "geo_objects": db.query(models.Satellite).filter(
            models.Satellite.orbit_type.ilike("%GEO%")).count(),
    }


@router.get("/{norad_id}", tags=["satellites"])
@cache(expire=300)
def get_satellite(norad_id: int, db: Session = Depends(get_db)):
    sat = db.query(models.Satellite).filter(models.Satellite.norad_id == norad_id).first()
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return sat


@router.get("/{norad_id}/explain", tags=["satellites"])
def explain_satellite(norad_id: int, level: str = "general", db: Session = Depends(get_db)):
    """Generate AI explanation for this satellite."""
    sat = db.query(models.Satellite).filter(models.Satellite.norad_id == norad_id).first()
    if not sat:
        raise HTTPException(status_code=404, detail="Satellite not found")
    context = f"Orbit type: {sat.orbit_type}, Inclination: {sat.inclination}°, Operator: {sat.operator}"
    result = generate_explanation(
        topic=f"Satellite: {sat.name} (NORAD {norad_id})",
        context=context,
        level=level,
    )
    # Cache in DB
    if result.get("verified"):
        sat.ai_summary = result["text"]
        sat.ai_confidence = result["confidence"]
        db.commit()
    return result
