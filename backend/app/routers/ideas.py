"""Community Ideas Board router — fixed field names to match models.py."""
import hashlib
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app import models
from app.auth import get_current_owner

router = APIRouter()


class IdeaCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None


class IdeaComment(BaseModel):
    comment: str


@router.get("/")
def get_ideas(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List approved public ideas, ordered by vote count."""
    q = db.query(models.CommunityIdea).filter(models.CommunityIdea.status == "approved")
    if category:
        q = q.filter(models.CommunityIdea.category == category)
    return q.order_by(models.CommunityIdea.vote_count.desc()).offset(skip).limit(limit).all()


@router.get("/pending")
def get_pending_ideas(
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """List pending ideas — owner only."""
    return (
        db.query(models.CommunityIdea)
        .filter(models.CommunityIdea.status == "pending")
        .order_by(models.CommunityIdea.created_at.desc())
        .all()
    )


@router.post("/")
def create_idea(idea: IdeaCreate, request: Request, db: Session = Depends(get_db)):
    """Submit a public idea (anonymous)."""
    ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(ip.encode()).hexdigest()
    db_idea = models.CommunityIdea(
        title=idea.title,
        description=idea.description,
        category=idea.category,
        ip_hash=ip_hash,
        status="pending",
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea


@router.post("/{idea_id}/vote")
def vote_idea(idea_id: int, db: Session = Depends(get_db)):
    """Upvote an approved idea."""
    idea = db.query(models.CommunityIdea).filter(models.CommunityIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    if idea.status != "approved":
        raise HTTPException(status_code=400, detail="Can only vote on approved ideas")
    idea.vote_count = (idea.vote_count or 0) + 1
    db.commit()
    return {"message": "Vote recorded", "vote_count": idea.vote_count}


@router.patch("/{idea_id}/approve")
def approve_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Approve a pending idea — owner only."""
    idea = db.query(models.CommunityIdea).filter(models.CommunityIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    idea.status = "approved"
    db.commit()
    return {"message": "Idea approved"}


@router.patch("/{idea_id}/reject")
def reject_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Reject a pending idea — owner only."""
    idea = db.query(models.CommunityIdea).filter(models.CommunityIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    idea.status = "rejected"
    db.commit()
    return {"message": "Idea rejected"}


@router.patch("/{idea_id}/comment")
def add_owner_comment(
    idea_id: int,
    body: IdeaComment,
    db: Session = Depends(get_db),
    _owner: str = Depends(get_current_owner),
):
    """Add owner comment to an idea — owner only."""
    idea = db.query(models.CommunityIdea).filter(models.CommunityIdea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    idea.owner_comment = body.comment
    db.commit()
    return {"message": "Comment added"}
