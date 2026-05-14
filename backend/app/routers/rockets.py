"""Rockets router — Rocket Systems Explorer."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from fastapi_cache.decorator import cache
from app.services.groq_ai import generate_explanation

router = APIRouter()

# Curated rocket seed data
SEED_ROCKETS = [
    {
        "slug": "falcon-9", "name": "Falcon 9", "operator": "SpaceX", "country": "USA",
        "height_m": 70.0, "diameter_m": 3.7, "mass_kg": 549054, "leo_capacity_kg": 22800,
        "gto_capacity_kg": 8300, "stages": 2, "reusable": True, "status": "active",
        "first_flight": "2010-06-04", "total_launches": 300, "total_successes": 298,
        "propellant_stage1": "RP-1/LOX", "propellant_stage2": "RP-1/LOX",
        "engine_stage1": "9x Merlin 1D", "engine_stage2": "1x Merlin 1D Vacuum",
        "thrust_kn": 7607.0, "isp_vacuum_s": 348,
        "description": "SpaceX's workhorse orbital launch vehicle with a reusable first stage. The Falcon 9 is the world's first orbital class rocket to successfully reuse its first stage booster.",
    },
    {
        "slug": "falcon-heavy", "name": "Falcon Heavy", "operator": "SpaceX", "country": "USA",
        "height_m": 70.0, "diameter_m": 12.2, "mass_kg": 1420788, "leo_capacity_kg": 63800,
        "gto_capacity_kg": 26700, "stages": 2, "reusable": True, "status": "active",
        "first_flight": "2018-02-06", "total_launches": 10, "total_successes": 10,
        "propellant_stage1": "RP-1/LOX", "propellant_stage2": "RP-1/LOX",
        "engine_stage1": "27x Merlin 1D", "engine_stage2": "1x Merlin 1D Vacuum",
        "thrust_kn": 22819.0, "isp_vacuum_s": 348,
        "description": "The world's most powerful operational rocket, composed of three Falcon 9 cores. Capable of carrying heavy payloads to deep space trajectories.",
    },
    {
        "slug": "starship", "name": "Starship", "operator": "SpaceX", "country": "USA",
        "height_m": 121.0, "diameter_m": 9.0, "mass_kg": 5000000, "leo_capacity_kg": 150000,
        "gto_capacity_kg": 21000, "stages": 2, "reusable": True, "status": "development",
        "first_flight": "2023-04-20", "total_launches": 7, "total_successes": 3,
        "propellant_stage1": "CH4/LOX (Methalox)", "propellant_stage2": "CH4/LOX (Methalox)",
        "engine_stage1": "33x Raptor 2", "engine_stage2": "6x Raptor 2",
        "thrust_kn": 74400.0, "isp_vacuum_s": 380,
        "description": "SpaceX's next-generation fully reusable super-heavy launch vehicle. Designed for Earth orbit, Moon, Mars, and beyond. The most powerful launch vehicle ever built.",
    },
    {
        "slug": "sls-block-1", "name": "SLS Block 1", "operator": "NASA", "country": "USA",
        "height_m": 98.0, "diameter_m": 8.4, "mass_kg": 2600000, "leo_capacity_kg": 95000,
        "gto_capacity_kg": 27000, "stages": 2, "reusable": False, "status": "active",
        "first_flight": "2022-11-16", "total_launches": 1, "total_successes": 1,
        "propellant_stage1": "LH2/LOX", "propellant_stage2": "LH2/LOX (ICPS)",
        "engine_stage1": "4x RS-25 + 2x SRB", "engine_stage2": "1x RL10B-2",
        "thrust_kn": 39000.0, "isp_vacuum_s": 452,
        "description": "NASA's Space Launch System designed for the Artemis Moon program. The most powerful rocket NASA has ever built, capable of sending crewed Orion spacecraft to lunar orbit.",
    },
    {
        "slug": "ariane-5", "name": "Ariane 5", "operator": "ArianeGroup / ESA", "country": "France",
        "height_m": 53.0, "diameter_m": 5.4, "mass_kg": 777000, "leo_capacity_kg": 21000,
        "gto_capacity_kg": 10865, "stages": 2, "reusable": False, "status": "retired",
        "first_flight": "1996-06-04", "total_launches": 117, "total_successes": 112,
        "propellant_stage1": "LH2/LOX", "propellant_stage2": "MMH/N2O4",
        "engine_stage1": "1x Vulcain 2 + 2x P241 SRB", "engine_stage2": "1x HM7B or Aestus",
        "thrust_kn": 13170.0, "isp_vacuum_s": 446,
        "description": "Europe's highly reliable heavy-lift launch vehicle that served ESA for over 27 years. Launched the James Webb Space Telescope, Rosetta, BepiColombo, and over 100 commercial satellites.",
    },
    {
        "slug": "pslv-c", "name": "PSLV-C", "operator": "ISRO", "country": "India",
        "height_m": 44.4, "diameter_m": 2.8, "mass_kg": 320000, "leo_capacity_kg": 3800,
        "gto_capacity_kg": 1410, "stages": 4, "reusable": False, "status": "active",
        "first_flight": "1993-09-20", "total_launches": 60, "total_successes": 57,
        "propellant_stage1": "HTPB solid", "propellant_stage2": "N2O4/UDMH",
        "engine_stage1": "S139 solid motor", "engine_stage2": "Vikas engine",
        "thrust_kn": 4860.0, "isp_vacuum_s": 295,
        "description": "India's most reliable rocket, the workhorse of ISRO. Famous for launching 104 satellites in a single mission and sending Chandrayaan-1 and Mars Orbiter Mission to their destinations.",
    },
    {
        "slug": "new-shepard", "name": "New Shepard", "operator": "Blue Origin", "country": "USA",
        "height_m": 18.0, "diameter_m": 3.66, "mass_kg": 75000, "leo_capacity_kg": 0,
        "gto_capacity_kg": 0, "stages": 1, "reusable": True, "status": "active",
        "first_flight": "2015-04-29", "total_launches": 23, "total_successes": 22,
        "propellant_stage1": "LH2/LOX", "propellant_stage2": None,
        "engine_stage1": "1x BE-3", "engine_stage2": None,
        "thrust_kn": 490.0, "isp_vacuum_s": 450,
        "description": "Blue Origin's suborbital tourism vehicle, fully reusable with both booster and capsule landing autonomously. Designed for brief 11-minute flights to the Kármán line.",
    },
    {
        "slug": "gslv-mk3", "name": "GSLV Mk III (LVM3)", "operator": "ISRO", "country": "India",
        "height_m": 43.43, "diameter_m": 4.0, "mass_kg": 640000, "leo_capacity_kg": 10000,
        "gto_capacity_kg": 4000, "stages": 3, "reusable": False, "status": "active",
        "first_flight": "2017-06-05", "total_launches": 7, "total_successes": 7,
        "propellant_stage1": "HTPB solid (S200 boosters)", "propellant_stage2": "LH2/LOX",
        "engine_stage1": "2x S200 solid boosters", "engine_stage2": "CE-20 cryogenic",
        "thrust_kn": 6460.0, "isp_vacuum_s": 443,
        "description": "ISRO's most powerful rocket, designed to place heavy satellites into geostationary orbit. Launched Chandrayaan-3 to the Moon and OneWeb satellites. India's gateway to heavy payload missions.",
    },
]


@router.get("/")
@cache(expire=300)
def get_rockets(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    operator: Optional[str] = None,
    status: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List rockets with optional filters."""
    q = db.query(models.Rocket)
    if operator:
        q = q.filter(models.Rocket.operator.ilike(f"%{operator}%"))
    if status:
        q = q.filter(models.Rocket.status.ilike(f"%{status}%"))
    if country:
        q = q.filter(models.Rocket.country.ilike(f"%{country}%"))
    return q.order_by(models.Rocket.name).offset(skip).limit(limit).all()


@router.get("/stats")
@cache(expire=300)
def get_rocket_stats(db: Session = Depends(get_db)):
    """Summary statistics for rockets."""
    total = db.query(models.Rocket).count()
    active = db.query(models.Rocket).filter(models.Rocket.status == "active").count()
    reusable = db.query(models.Rocket).filter(models.Rocket.reusable == True).count()
    return {"total": total, "active": active, "reusable": reusable, "retired": total - active}


@router.get("/{rocket_id}")
@cache(expire=300)
def get_rocket(rocket_id: int, db: Session = Depends(get_db)):
    """Get a single rocket by ID."""
    rocket = db.query(models.Rocket).filter(models.Rocket.id == rocket_id).first()
    if not rocket:
        raise HTTPException(status_code=404, detail="Rocket not found")
    return rocket


@router.get("/{rocket_id}/explain")
def explain_rocket(rocket_id: int, db: Session = Depends(get_db)):
    """Generate an AI explanation of the rocket."""
    rocket = db.query(models.Rocket).filter(models.Rocket.id == rocket_id).first()
    if not rocket:
        raise HTTPException(status_code=404, detail="Rocket not found")
    
    context = (
        f"Rocket: {rocket.name}, Operator: {rocket.operator}, "
        f"Stages: {rocket.stages}, Reusable: {rocket.reusable}, "
        f"Capacity to LEO: {rocket.leo_capacity_kg}kg, "
        f"Description: {rocket.description}"
    )
    topic = f"Explain the engineering and purpose of the {rocket.name} rocket."
    
    explanation = generate_explanation(topic=topic, context=context, level="general")
    return explanation


@router.post("/seed")
def seed_rockets(db: Session = Depends(get_db)):
    """Seed curated rocket data if DB is empty."""
    existing = db.query(models.Rocket).count()
    if existing > 0:
        return {"message": f"Database already has {existing} rocket records.", "seeded": 0}
    count = 0
    for r in SEED_ROCKETS:
        db_rocket = models.Rocket(**r)
        db.add(db_rocket)
        count += 1
    db.commit()
    return {"message": f"Seeded {count} rocket records.", "seeded": count}
