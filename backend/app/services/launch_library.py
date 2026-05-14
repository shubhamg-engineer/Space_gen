"""Launch Library 2 (The Space Devs) integration."""
import httpx
from sqlalchemy.orm import Session
from app import models

LL2_BASE = "https://ll.thespacedevs.com/2.2.0"


def _safe_get(url: str, params: dict = None) -> dict | None:
    try:
        r = httpx.get(url, params=params, timeout=20.0,
                      headers={"User-Agent": "SIP/1.0 (space-intelligence-platform)"})
        r.raise_for_status()
        return r.json()
    except Exception as exc:
        print(f"[LL2] Error fetching {url}: {exc}")
        return None


def _upsert_launches(db: Session, results: list) -> int:
    count = 0
    for item in results:
        ll2_id = item.get("id")
        launch = db.query(models.Launch).filter(models.Launch.ll2_id == ll2_id).first()
        if not launch:
            launch = models.Launch(ll2_id=ll2_id)
            db.add(launch)
        launch.name = item.get("name", "Unknown")
        rocket = item.get("rocket", {})
        config = rocket.get("configuration", {}) if rocket else {}
        launch.vehicle = config.get("full_name") or config.get("name")
        agency_list = item.get("launch_service_provider", {})
        launch.agency = agency_list.get("name") if agency_list else None
        launch.net = item.get("net")
        launch.window_start = item.get("window_start")
        launch.window_end = item.get("window_end")
        status = item.get("status", {})
        launch.status_abbrev = status.get("abbrev")
        launch.status_name = status.get("name")
        mission = item.get("mission", {})
        if mission:
            launch.mission_type = mission.get("type")
            launch.orbit = (mission.get("orbit") or {}).get("abbrev")
            launch.mission_description = mission.get("description")
        pad = item.get("pad", {})
        launch.launch_site = pad.get("name") if pad else None
        vids = item.get("vidURLs", [])
        launch.webcast_url = vids[0].get("url") if vids else None
        launch.image_url = item.get("image")
        launch.is_active = launch.status_abbrev in ("Go", "InFlight")
        count += 1
    db.commit()
    return count


def sync_upcoming_launches(db: Session, limit: int = 100) -> int:
    """Fetch upcoming launches and upsert into DB."""
    data = _safe_get(f"{LL2_BASE}/launch/upcoming/", params={"limit": limit, "mode": "detailed"})
    if not data:
        return 0
    return _upsert_launches(db, data.get("results", []))


def sync_recent_launches(db: Session, limit: int = 30) -> int:
    """Fetch recent previous launches and upsert into DB."""
    data = _safe_get(f"{LL2_BASE}/launch/previous/", params={"limit": limit, "mode": "detailed"})
    if not data:
        return 0
    return _upsert_launches(db, data.get("results", []))


def get_active_launch() -> dict | None:
    """Return the first currently active (in-flight) launch from LL2."""
    data = _safe_get(f"{LL2_BASE}/launch/", params={"status__abbrev": "InFlight", "limit": 1})
    if data and data.get("results"):
        return data["results"][0]
    return None
