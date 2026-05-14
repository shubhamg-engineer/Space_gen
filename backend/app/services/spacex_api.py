"""
SpaceX API v5 integration — completely free, no auth required.
Source: https://github.com/r-spacex/SpaceX-API

Provides:
  - Rockets (Falcon 9, Falcon Heavy, Starship, etc.)
  - Launches (past + upcoming)
  - Starlink satellite constellation stats
  - Capsules (Dragon)
  - Launchpads
"""
import httpx
import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger("sip.spacex")

SPACEX_BASE = "https://api.spacexdata.com/v5"
SPACEX_V4   = "https://api.spacexdata.com/v4"   # some endpoints still on v4


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get(url: str, params: dict | None = None) -> dict | list | None:
    try:
        r = httpx.get(url, params=params, timeout=20.0)
        r.raise_for_status()
        return r.json()
    except Exception as exc:
        logger.error(f"[SpaceX] GET {url} → {exc}")
        return None


def _post(url: str, body: dict) -> dict | list | None:
    try:
        r = httpx.post(url, json=body, timeout=20.0)
        r.raise_for_status()
        return r.json()
    except Exception as exc:
        logger.error(f"[SpaceX] POST {url} → {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Rockets
# ─────────────────────────────────────────────────────────────────────────────

def get_all_rockets() -> list[dict]:
    """Return all SpaceX rockets with full specs."""
    data = _get(f"{SPACEX_V4}/rockets")
    return data if isinstance(data, list) else []


def sync_spacex_rockets(db: Session) -> int:
    """Fetch SpaceX rockets and upsert into the rockets table."""
    rockets = get_all_rockets()
    count = 0
    for item in rockets:
        slug = item.get("id") or item.get("name", "").lower().replace(" ", "_")
        rocket = db.query(models.Rocket).filter(
            models.Rocket.slug == slug
        ).first()
        if not rocket:
            rocket = models.Rocket(slug=slug)
            db.add(rocket)

        rocket.name            = item.get("name", "Unknown")
        rocket.operator        = "SpaceX"
        rocket.country         = item.get("country", "USA")
        rocket.height_m        = (item.get("height") or {}).get("meters")
        rocket.diameter_m      = (item.get("diameter") or {}).get("meters")
        rocket.mass_kg         = (item.get("mass") or {}).get("kg")
        rocket.leo_capacity_kg = (item.get("payload_weights") or [{}])[0].get("kg")
        rocket.stages          = item.get("stages")
        rocket.reusable        = item.get("reusable", False)
        rocket.first_flight    = item.get("first_flight")
        rocket.total_launches  = item.get("success_rate_pct", 0) and item.get("flickr_images") and 0
        rocket.status          = "active" if item.get("active") else "retired"
        rocket.description     = item.get("description")

        # Engine details
        engines = item.get("engines") or {}
        rocket.engine_stage1   = engines.get("type", "").title()
        rocket.propellant_stage1 = engines.get("propellant_1")
        rocket.propellant_stage2 = engines.get("propellant_2")
        rocket.thrust_kn       = (engines.get("thrust_sea_level") or {}).get("kN")
        rocket.isp_vacuum_s    = (engines.get("isp") or {}).get("vacuum")
        count += 1

    db.commit()
    logger.info(f"[SpaceX] {count} rockets synced.")
    return count


# ─────────────────────────────────────────────────────────────────────────────
# Launches (past + upcoming)
# ─────────────────────────────────────────────────────────────────────────────

def get_upcoming_launches(limit: int = 20) -> list[dict]:
    """Return the next N upcoming SpaceX launches."""
    body = {
        "query":   {"upcoming": True},
        "options": {
            "sort":    {"date_utc": "asc"},
            "limit":   limit,
            "populate": ["rocket", "payloads", "launchpad"],
        },
    }
    data = _post(f"{SPACEX_BASE}/launches/query", body)
    return (data or {}).get("docs", [])


def get_past_launches(limit: int = 50) -> list[dict]:
    """Return the N most recent past SpaceX launches."""
    body = {
        "query":   {"upcoming": False, "success": {"$exists": True}},
        "options": {
            "sort":    {"date_utc": "desc"},
            "limit":   limit,
            "populate": ["rocket", "payloads", "launchpad"],
        },
    }
    data = _post(f"{SPACEX_BASE}/launches/query", body)
    return (data or {}).get("docs", [])


def get_latest_launch() -> dict | None:
    """Return the single most recent SpaceX launch."""
    return _get(f"{SPACEX_BASE}/launches/latest")


def get_next_launch() -> dict | None:
    """Return the next upcoming SpaceX launch."""
    return _get(f"{SPACEX_BASE}/launches/next")


# ─────────────────────────────────────────────────────────────────────────────
# Starlink
# ─────────────────────────────────────────────────────────────────────────────

def get_starlink_stats() -> dict:
    """Return a summary of the Starlink constellation."""
    data = _get(f"{SPACEX_V4}/starlink")
    if not isinstance(data, list):
        return {}
    total  = len(data)
    active = sum(1 for s in data if (s.get("spaceTrack") or {}).get("DECAYED") == 0)
    return {
        "total_satellites": total,
        "estimated_active": active,
        "source": "SpaceX API v4",
    }


# ─────────────────────────────────────────────────────────────────────────────
# Capsules (Dragon)
# ─────────────────────────────────────────────────────────────────────────────

def get_capsules() -> list[dict]:
    """Return all Dragon capsules with reuse counts."""
    data = _get(f"{SPACEX_V4}/capsules")
    return data if isinstance(data, list) else []


# ─────────────────────────────────────────────────────────────────────────────
# Launchpads
# ─────────────────────────────────────────────────────────────────────────────

def get_launchpads() -> list[dict]:
    """Return all SpaceX launchpad details."""
    data = _get(f"{SPACEX_V4}/launchpads")
    return data if isinstance(data, list) else []


# ─────────────────────────────────────────────────────────────────────────────
# Failure intelligence — map failed SpaceX launches to the Failure model
# ─────────────────────────────────────────────────────────────────────────────

def sync_spacex_failures(db: Session) -> int:
    """
    Fetch all SpaceX launches where success=False and upsert into the
    failures table. Complements any existing historical failure data.
    """
    body = {
        "query":   {"success": False},
        "options": {"sort": {"date_utc": "desc"}, "limit": 100},
    }
    data = _post(f"{SPACEX_BASE}/launches/query", body)
    launches = (data or {}).get("docs", [])
    count = 0
    for item in launches:
        name = item.get("name", "Unknown SpaceX Mission")
        existing = db.query(models.Failure).filter(
            models.Failure.mission_name == name
        ).first()
        if existing:
            continue

        failure = models.Failure(
            mission_name=name,
            date=item.get("date_utc", "")[:10] if item.get("date_utc") else None,
            agency="SpaceX",
            vehicle=(item.get("rocket") or {}).get("name") if isinstance(
                item.get("rocket"), dict) else None,
            failure_phase="ascent",
            primary_cause="; ".join(
                f.get("reason", "") for f in (item.get("failures") or []) if f.get("reason")
            ) or None,
            failure_mode_detail=item.get("details"),
            outcome="total_loss",
            severity="major",
        )
        db.add(failure)
        count += 1

    db.commit()
    logger.info(f"[SpaceX] {count} new failure records synced.")
    return count
