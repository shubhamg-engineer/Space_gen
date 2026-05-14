from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.database import get_db
from app.models import Asteroid, SpaceEconomy, SustainabilityScore

router = APIRouter()

@router.get("/asteroids")
def get_asteroids(db: Session = Depends(get_db)):
    """Module 6.19 - NEO Monitor: Get all potentially hazardous asteroids"""
    asteroids = db.query(Asteroid).all()
    return asteroids

@router.get("/economy/funding")
def get_funding_rounds(db: Session = Depends(get_db)):
    """Module 6.21 - Space Economy: Get funding rounds"""
    rounds = db.query(SpaceEconomy).all()
    return rounds

@router.get("/sustainability")
def get_sustainability_scores(db: Session = Depends(get_db)):
    """Module 6.24 - Space Law: Get sustainability scores"""
    scores = db.query(SustainabilityScore).all()
    return scores
