"""Owner module router — JWT-protected notes + dashboard stats."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app.auth import get_current_owner
from pydantic import BaseModel

router = APIRouter()


class NoteCreate(BaseModel):
    title: str
    content: str
    tags: Optional[str] = None
    linked_module: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    linked_module: Optional[str] = None


@router.get("/notes")
def get_notes(
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """List owner notes — JWT protected."""
    return db.query(models.OwnerNote).order_by(models.OwnerNote.created_at.desc()).all()


@router.post("/notes")
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Create an owner note — JWT protected."""
    db_note = models.OwnerNote(
        title=note.title,
        content=note.content,
        tags=note.tags,
        linked_module=note.linked_module,
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.put("/notes/{note_id}")
def update_note(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Update an owner note — JWT protected."""
    db_note = db.query(models.OwnerNote).filter(models.OwnerNote.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, val in note.dict(exclude_none=True).items():
        setattr(db_note, field, val)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/notes/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Delete an owner note — JWT protected."""
    db_note = db.query(models.OwnerNote).filter(models.OwnerNote.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted"}


@router.get("/dashboard")
def get_owner_dashboard(
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Owner dashboard stats — JWT protected."""
    notes_count = db.query(models.OwnerNote).count()
    active_launches = db.query(models.Launch).filter(models.Launch.is_active == True).count()
    upcoming_launches = (
        db.query(models.Launch)
        .filter(models.Launch.status_abbrev.in_(["Go", "TBD", "TBC"]))
        .order_by(models.Launch.net.asc())
        .limit(5)
        .all()
    )
    news_count = db.query(models.NewsArticle).count()
    ideas_pending = db.query(models.CommunityIdea).filter(models.CommunityIdea.status == "pending").count()
    weather_count = db.query(models.SpaceWeather).count()

    return {
        "notes_count": notes_count,
        "active_launches": active_launches,
        "news_count": news_count,
        "ideas_pending": ideas_pending,
        "weather_events_count": weather_count,
        "upcoming_launches": [
            {"id": l.id, "name": l.name, "net": l.net, "vehicle": l.vehicle,
             "agency": l.agency, "status": l.status_abbrev}
            for l in upcoming_launches
        ],
    }
