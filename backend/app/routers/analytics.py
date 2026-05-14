"""Analytics router — aggregated platform statistics."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models

router = APIRouter()


@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Get aggregated analytics summary across all modules."""
    total_satellites = db.query(models.Satellite).count()
    active_satellites = db.query(models.Satellite).filter(
        models.Satellite.status.ilike("%active%")).count()
    total_missions = db.query(models.Mission).count()
    total_rockets = db.query(models.Rocket).count()
    active_rockets = db.query(models.Rocket).filter(
        models.Rocket.status.ilike("%active%")).count()
    total_failures = db.query(models.Failure).count()
    catastrophic_failures = db.query(models.Failure).filter(
        models.Failure.severity == "catastrophic").count()
    total_launches = db.query(models.Launch).count()
    upcoming_launches = db.query(models.Launch).filter(
        models.Launch.status_abbrev.in_(["Go", "TBD", "TBC"])).count()
    total_astronauts = db.query(models.Astronaut).count()
    total_news = db.query(models.NewsArticle).count()

    # Orbit distribution
    orbit_dist_rows = (
        db.query(models.Satellite.orbit_type, func.count(models.Satellite.id))
        .filter(models.Satellite.orbit_type.isnot(None))
        .group_by(models.Satellite.orbit_type)
        .all()
    )
    orbit_distribution = {row[0]: row[1] for row in orbit_dist_rows}

    # Failure cause distribution
    cause_rows = (
        db.query(models.Failure.root_cause_category, func.count(models.Failure.id))
        .filter(models.Failure.root_cause_category.isnot(None))
        .group_by(models.Failure.root_cause_category)
        .all()
    )
    failure_causes = {row[0]: row[1] for row in cause_rows}

    # Failure phase distribution
    phase_rows = (
        db.query(models.Failure.failure_phase, func.count(models.Failure.id))
        .filter(models.Failure.failure_phase.isnot(None))
        .group_by(models.Failure.failure_phase)
        .all()
    )
    failure_phases = {row[0]: row[1] for row in phase_rows}

    # Launches by agency
    agency_rows = (
        db.query(models.Launch.agency, func.count(models.Launch.id))
        .filter(models.Launch.agency.isnot(None))
        .group_by(models.Launch.agency)
        .all()
    )
    launches_by_agency = {row[0]: row[1] for row in agency_rows}

    return {
        "satellites": {
            "total": total_satellites,
            "active": active_satellites,
        },
        "missions": {"total": total_missions},
        "rockets": {
            "total": total_rockets,
            "active": active_rockets,
        },
        "failures": {
            "total": total_failures,
            "catastrophic": catastrophic_failures,
            "by_cause": failure_causes,
            "by_phase": failure_phases,
        },
        "launches": {
            "total": total_launches,
            "upcoming": upcoming_launches,
            "by_agency": launches_by_agency,
        },
        "astronauts": {"total": total_astronauts},
        "news": {"total": total_news},
        "orbit_distribution": orbit_distribution,
    }
