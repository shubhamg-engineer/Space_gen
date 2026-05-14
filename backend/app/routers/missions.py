"""Missions router — Mission Intelligence."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from fastapi_cache.decorator import cache

router = APIRouter()

SEED_MISSIONS = [
    {
        "name": "Artemis I",
        "agency": "NASA",
        "destination": "Moon",
        "status": "complete",
        "description": "The first uncrewed flight test of the Space Launch System and the Orion spacecraft around the Moon.",
    },
    {
        "name": "Voyager 1",
        "agency": "NASA",
        "destination": "Interstellar Space",
        "status": "active",
        "description": "A space probe launched in 1977 to study the outer Solar System. It is the most distant human-made object from Earth.",
    },
    {
        "name": "James Webb Space Telescope",
        "agency": "NASA/ESA/CSA",
        "destination": "Sun-Earth L2",
        "status": "active",
        "description": "The largest and most powerful space telescope ever built, designed to observe the universe in infrared light.",
    },
    {
        "name": "Perseverance Rover",
        "agency": "NASA",
        "destination": "Mars",
        "status": "active",
        "description": "A car-sized Mars rover designed to explore the Jezero crater on Mars as part of NASA's Mars 2020 mission.",
    },
    {
        "name": "Europa Clipper",
        "agency": "NASA",
        "destination": "Jupiter/Europa",
        "status": "development",
        "description": "An interplanetary mission in development by NASA to study the Galilean moon Europa through a series of flybys.",
    },
    {
        "name": "Chandrayaan-3",
        "agency": "ISRO",
        "destination": "Moon",
        "status": "complete",
        "description": "India's third lunar exploration mission, which successfully landed a rover near the lunar south pole.",
    },
    {
        "name": "Polaris Dawn",
        "agency": "SpaceX",
        "destination": "Low Earth Orbit",
        "status": "active",
        "description": "A private human spaceflight mission operated by SpaceX, featuring the first commercial spacewalk.",
    }
]


@router.get("/")
@cache(expire=300)
def get_missions(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    status: Optional[str] = None,
    agency: Optional[str] = None,
    destination: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List missions with optional filters."""
    q = db.query(models.Mission)
    if status:
        q = q.filter(models.Mission.status.ilike(f"%{status}%"))
    if agency:
        q = q.filter(models.Mission.agency.ilike(f"%{agency}%"))
    if destination:
        q = q.filter(models.Mission.destination.ilike(f"%{destination}%"))
    return q.order_by(models.Mission.name).offset(skip).limit(limit).all()


@router.get("/stats")
@cache(expire=300)
def get_mission_stats(db: Session = Depends(get_db)):
    """Summary statistics for missions."""
    total = db.query(models.Mission).count()
    active = db.query(models.Mission).filter(models.Mission.status == "active").count()
    complete = db.query(models.Mission).filter(models.Mission.status == "complete").count()
    return {"total": total, "active": active, "complete": complete, "other": total - (active + complete)}


@router.get("/{mission_id}")
@cache(expire=300)
def get_mission(mission_id: int, db: Session = Depends(get_db)):
    """Get a single mission by ID."""
    mission = db.query(models.Mission).filter(models.Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission


@router.post("/seed")
def seed_missions(db: Session = Depends(get_db)):
    """Seed curated mission data if DB is empty."""
    existing = db.query(models.Mission).count()
    if existing > 0:
        return {"message": f"Database already has {existing} mission records.", "seeded": 0}
    count = 0
    for m in SEED_MISSIONS:
        db_mission = models.Mission(**m)
        db.add(db_mission)
        count += 1
    db.commit()
    return {"message": f"Seeded {count} mission records.", "seeded": count}
