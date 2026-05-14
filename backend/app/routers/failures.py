"""Failures router — Failure Intelligence Engine."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from pydantic import BaseModel
from app.services.groq_ai import generate_explanation

router = APIRouter()

# Historical space failures seed data
SEED_FAILURES = [
    {
        "mission_name": "Apollo 1", "date": "1967-01-27", "agency": "NASA",
        "vehicle": "Saturn IB", "failure_phase": "pad", "primary_cause": "Cabin fire during launch rehearsal",
        "root_cause_category": "human_error", "severity": "catastrophic", "crew_involved": True,
        "outcome": "crew_lost", "failure_mode_detail": "Pure oxygen atmosphere ignited from electrical arc in cockpit wiring.",
        "lessons_learned": "Redesigned spacecraft with hatch that opens outward; switched to mixed gas atmosphere at launch.",
    },
    {
        "mission_name": "Challenger STS-51-L", "date": "1986-01-28", "agency": "NASA",
        "vehicle": "Space Shuttle Challenger", "failure_phase": "ascent", "primary_cause": "O-ring seal failure on right SRB",
        "root_cause_category": "structural", "severity": "catastrophic", "crew_involved": True,
        "outcome": "crew_lost", "failure_mode_detail": "Cold temperatures caused O-ring to fail, allowing hot gases to breach the joint and ignite the external tank.",
        "lessons_learned": "Redesigned SRB joints; improved safety culture and decision-making processes.",
    },
    {
        "mission_name": "Columbia STS-107", "date": "2003-02-01", "agency": "NASA",
        "vehicle": "Space Shuttle Columbia", "failure_phase": "re-entry", "primary_cause": "Foam strike on leading edge of wing",
        "root_cause_category": "structural", "severity": "catastrophic", "crew_involved": True,
        "outcome": "crew_lost", "failure_mode_detail": "Foam debris from external tank damaged the leading edge thermal protection, leading to structural breakup during re-entry.",
        "lessons_learned": "Enhanced inspection protocols; Return-to-Flight procedure added in-orbit inspection.",
    },
    {
        "mission_name": "Mars Observer", "date": "1993-08-21", "agency": "NASA",
        "vehicle": "Mars Observer", "failure_phase": "orbit", "primary_cause": "Propellant system rupture",
        "root_cause_category": "propulsion", "severity": "major", "crew_involved": False,
        "outcome": "total_loss", "failure_mode_detail": "Rupture in propellant line during pressurization for Mars orbit insertion maneuver.",
        "lessons_learned": "Redundancy required in critical propellant systems for planetary missions.",
    },
    {
        "mission_name": "Mars Climate Orbiter", "date": "1999-09-23", "agency": "NASA",
        "vehicle": "Mars Climate Orbiter", "failure_phase": "orbit", "primary_cause": "Unit conversion error (imperial vs metric)",
        "root_cause_category": "software", "severity": "major", "crew_involved": False,
        "outcome": "total_loss", "failure_mode_detail": "Lockheed Martin used imperial units while NASA used metric, causing navigational error that destroyed the spacecraft.",
        "lessons_learned": "Mandatory software interface audits; strict unit-consistency requirements across all teams.",
    },
    {
        "mission_name": "Antares CRS Orb-3", "date": "2014-10-28", "agency": "Orbital Sciences",
        "vehicle": "Antares 130", "failure_phase": "ascent", "primary_cause": "Engine turbopump failure",
        "root_cause_category": "propulsion", "severity": "major", "crew_involved": False,
        "outcome": "total_loss", "failure_mode_detail": "AJ26 engine turbopump failure caused vehicle to fall back to launch pad and explode.",
        "lessons_learned": "Antares transitioned to Russian RD-181 engines; enhanced engine acceptance testing.",
    },
    {
        "mission_name": "ISRO GSAT-6A", "date": "2018-03-29", "agency": "ISRO",
        "vehicle": "GSLV-F08", "failure_phase": "orbit", "primary_cause": "Power system failure",
        "root_cause_category": "structural", "severity": "major", "crew_involved": False,
        "outcome": "total_loss", "failure_mode_detail": "Contact lost with satellite during second orbit-raising maneuver. Power system anomaly suspected.",
        "lessons_learned": "Enhanced power system redundancy and failure-mode analysis.",
    },
    {
        "mission_name": "Beresheet", "date": "2019-04-11", "agency": "SpaceIL",
        "vehicle": "Beresheet (lunar lander)", "failure_phase": "separation", "primary_cause": "Inertial measurement unit failure",
        "root_cause_category": "software", "severity": "major", "crew_involved": False,
        "outcome": "total_loss", "failure_mode_detail": "Software command reset the IMU during descent, causing main engine to shut down and crash landing.",
        "lessons_learned": "Backup systems needed for critical sensor chains; fault-tolerant software architecture.",
    },
]


class FailureCreate(BaseModel):
    mission_name: str
    date: Optional[str] = None
    agency: Optional[str] = None
    vehicle: Optional[str] = None
    failure_phase: Optional[str] = None
    primary_cause: Optional[str] = None
    root_cause_category: Optional[str] = None
    failure_mode_detail: Optional[str] = None
    outcome: Optional[str] = None
    crew_involved: bool = False
    severity: Optional[str] = None
    lessons_learned: Optional[str] = None
    corrective_actions: Optional[str] = None


@router.get("/")
def get_failures(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    vehicle: Optional[str] = None,
    agency: Optional[str] = None,
    severity: Optional[str] = None,
    phase: Optional[str] = None,
    cause: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List failure records with optional filters."""
    q = db.query(models.Failure)
    if vehicle:
        q = q.filter(models.Failure.vehicle.ilike(f"%{vehicle}%"))
    if agency:
        q = q.filter(models.Failure.agency.ilike(f"%{agency}%"))
    if severity:
        q = q.filter(models.Failure.severity == severity)
    if phase:
        q = q.filter(models.Failure.failure_phase == phase)
    if cause:
        q = q.filter(models.Failure.root_cause_category == cause)
    return q.order_by(models.Failure.date.desc()).offset(skip).limit(limit).all()


@router.get("/stats")
def get_failure_stats(db: Session = Depends(get_db)):
    """Failure statistics summary."""
    total = db.query(models.Failure).count()
    catastrophic = db.query(models.Failure).filter(models.Failure.severity == "catastrophic").count()
    crew_losses = db.query(models.Failure).filter(
        models.Failure.outcome == "crew_lost").count()
    return {
        "total": total,
        "catastrophic": catastrophic,
        "crew_losses": crew_losses,
        "non_crew": total - crew_losses,
    }


@router.get("/{failure_id}")
def get_failure(failure_id: int, db: Session = Depends(get_db)):
    """Get a single failure record."""
    failure = db.query(models.Failure).filter(models.Failure.id == failure_id).first()
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
    return failure


@router.get("/{failure_id}/explain")
def explain_failure(failure_id: int, db: Session = Depends(get_db)):
    """Generate an AI explanation of the failure."""
    failure = db.query(models.Failure).filter(models.Failure.id == failure_id).first()
    if not failure:
        raise HTTPException(status_code=404, detail="Failure not found")
    
    context = (
        f"Mission: {failure.mission_name}, Vehicle: {failure.vehicle}, "
        f"Phase: {failure.failure_phase}, Cause: {failure.primary_cause}, "
        f"Detail: {failure.failure_mode_detail}"
    )
    topic = f"Why did the {failure.mission_name} mission fail?"
    
    explanation = generate_explanation(topic=topic, context=context, level="technical")
    return explanation


@router.post("/seed")
def seed_failures(db: Session = Depends(get_db)):
    """Seed historical failure data if DB is empty."""
    existing = db.query(models.Failure).count()
    if existing > 0:
        return {"message": f"Database already has {existing} failure records.", "seeded": 0}
    count = 0
    for f in SEED_FAILURES:
        db_failure = models.Failure(**f)
        db.add(db_failure)
        count += 1
    db.commit()
    return {"message": f"Seeded {count} failure records.", "seeded": count}
