import asyncio
import json
import random
from fastapi import APIRouter, Depends, BackgroundTasks, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app.services.launch_library import sync_upcoming_launches, sync_recent_launches, get_active_launch

router = APIRouter()

@router.post("/sync")
def sync_launches(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Sync upcoming and recent launches from Launch Library 2."""
    background_tasks.add_task(sync_upcoming_launches, db)
    background_tasks.add_task(sync_recent_launches, db)
    return {"message": "Launch sync started."}

@router.get("/")
def get_launches(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    status: Optional[str] = None,
    agency: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List upcoming/recent launches."""
    q = db.query(models.Launch).order_by(models.Launch.net.asc())
    if status:
        q = q.filter(models.Launch.status_abbrev.ilike(f"%{status}%"))
    if agency:
        q = q.filter(models.Launch.agency.ilike(f"%{agency}%"))
    return q.offset(skip).limit(limit).all()

@router.get("/active")
def get_active_launches():
    """Return currently in-flight launch from LL2 (live call)."""
    data = get_active_launch()
    if not data:
        return {"active": False, "launch": None}
    return {"active": True, "launch": data}

@router.get("/upcoming/count")
def get_upcoming_count(db: Session = Depends(get_db)):
    count = db.query(models.Launch).filter(
        models.Launch.status_abbrev.in_(["Go", "TBD", "TBC"])).count()
    return {"upcoming": count}

@router.get("/{launch_id}")
def get_launch(launch_id: int, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    launch = db.query(models.Launch).filter(models.Launch.id == launch_id).first()
    if not launch:
        raise HTTPException(status_code=404, detail="Launch not found")
    return launch

@router.websocket("/live/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Simulated live launch telemetry stream for the Owner Dashboard.
    In a production scenario, this would tap into a pub/sub system driven by the background worker.
    """
    await websocket.accept()
    
    # Simulate a Falcon 9 launch timeline
    mission_time = -30 # T-minus 30 seconds
    altitude = 0.0
    velocity = 0.0
    
    phases = [
        {"time": -30, "name": "Terminal Count", "status": "GO"},
        {"time": 0, "name": "Liftoff", "status": "Engines Nominal"},
        {"time": 70, "name": "Max-Q", "status": "Max Dynamic Pressure"},
        {"time": 140, "name": "MECO", "status": "Main Engine Cutoff"},
        {"time": 145, "name": "Stage Separation", "status": "Success"},
        {"time": 155, "name": "SES-1", "status": "Second Engine Start"},
        {"time": 200, "name": "Fairing Separation", "status": "Success"},
    ]

    try:
        while True:
            past_phases = [p for p in phases if p["time"] <= mission_time]
            current_phase = past_phases[-1] if past_phases else phases[0]
            
            if mission_time > 0:
                # Basic physics simulation for visuals
                accel = 1.2 + (mission_time * 0.05) if mission_time < 140 else 0.5
                velocity += accel
                altitude += velocity * 0.01

            data = {
                "t_time": mission_time,
                "altitude_km": round(altitude, 2),
                "velocity_kmh": round(velocity * 3.6, 2),
                "phase": current_phase["name"],
                "phase_status": current_phase["status"]
            }
            
            await websocket.send_text(json.dumps(data))
            
            mission_time += 1
            await asyncio.sleep(1) # Send update every 1s
            
    except WebSocketDisconnect:
        pass
