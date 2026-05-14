"""Astronauts router — list current crew + astronaut database."""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app.services.open_notify import get_people_in_space

router = APIRouter()


@router.get("/")
def get_astronauts(
    skip: int = 0,
    limit: int = Query(default=30, le=100),
    agency: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List astronauts."""
    q = db.query(models.Astronaut)
    if agency:
        q = q.filter(models.Astronaut.agency.ilike(f"%{agency}%"))
    if status:
        q = q.filter(models.Astronaut.status.ilike(f"%{status}%"))
    return q.order_by(models.Astronaut.name).offset(skip).limit(limit).all()


@router.get("/in-space")
def get_astronauts_in_space():
    """Return currently in-space astronauts from Open Notify API (live)."""
    data = get_people_in_space()
    if data is None:
        return {"count": 0, "people": [], "source": "error"}
    return data


@router.get("/{astronaut_id}")
def get_astronaut(astronaut_id: int, db: Session = Depends(get_db)):
    """Get a single astronaut by ID."""
    astronaut = db.query(models.Astronaut).filter(models.Astronaut.id == astronaut_id).first()
    if not astronaut:
        raise HTTPException(status_code=404, detail="Astronaut not found")
    return astronaut


@router.post("/sync")
def sync_astronauts(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Sync current ISS crew from Open Notify into the DB."""
    def _sync():
        data = get_people_in_space()
        if not data:
            return
        for person in data.get("people", []):
            name = person.get("name", "")
            craft = person.get("craft", "ISS")
            existing = db.query(models.Astronaut).filter(
                models.Astronaut.name.ilike(name)).first()
            if not existing:
                astronaut = models.Astronaut(
                    name=name,
                    current_location=craft,
                    status="active",
                )
                db.add(astronaut)
        db.commit()

    background_tasks.add_task(_sync)
    return {"message": "Astronaut sync started."}
