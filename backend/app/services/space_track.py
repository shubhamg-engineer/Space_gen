"""
Space-Track.org integration — satellite TLE data.
Replaces celestrak.py with the definitive authoritative TLE source.
Register a free account at: https://www.space-track.org/auth/createAccount

Credentials are loaded from .env:
  SPACE_TRACK_IDENTITY=your_email
  SPACE_TRACK_PASSWORD=your_password

Falls back to CelesTrak if Space-Track credentials are not configured.
"""
import os
import httpx
from sqlalchemy.orm import Session
from app import models
import logging

logger = logging.getLogger("sip.space_track")

ST_BASE    = "https://www.space-track.org"
ST_LOGIN   = f"{ST_BASE}/ajaxauth/login"
ST_LOGOUT  = f"{ST_BASE}/ajaxauth/logout"
ST_TLE_URL = (
    f"{ST_BASE}/basicspacedata/query/class/gp/EPOCH/>now-30"
    "/orderby/NORAD_CAT_ID/limit/2000/format/tle/emptyresult/show"
)

CELESTRAK_FALLBACK = (
    "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
)
ISS_NORAD_ID = 25544


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _credentials_configured() -> bool:
    identity = os.getenv("SPACE_TRACK_IDENTITY", "")
    password = os.getenv("SPACE_TRACK_PASSWORD", "")
    return bool(identity and password and
                identity != "your_email@example.com" and
                password != "your_password_here")


def _parse_tle_text(tle_text: str) -> list[tuple[str, str, str]]:
    """Parse raw TLE text into (name, line1, line2) triples."""
    lines = [l.strip() for l in tle_text.strip().split("\n") if l.strip()]
    triples = []
    for i in range(0, len(lines) - 2, 3):
        triples.append((lines[i], lines[i + 1], lines[i + 2]))
    return triples


def _upsert_satellites(db: Session, triples: list[tuple[str, str, str]]) -> int:
    """Upsert (name, tle1, tle2) triples into DB. Returns count stored."""
    count = 0
    for name, line1, line2 in triples:
        try:
            norad_id = int(line1[2:7].strip())
        except (ValueError, IndexError):
            continue

        sat = db.query(models.Satellite).filter(
            models.Satellite.norad_id == norad_id
        ).first()
        if not sat:
            sat = models.Satellite(norad_id=norad_id)
            db.add(sat)

        sat.name = name
        sat.tle_line1 = line1
        sat.tle_line2 = line2
        sat.status = "Active"

        try:
            sat.inclination = float(line2[8:16].strip())
            mean_motion = float(line2[52:63].strip())
            sat.period = 1440.0 / mean_motion if mean_motion else None
        except (ValueError, IndexError):
            pass

        count += 1

    db.commit()
    return count


# ─────────────────────────────────────────────────────────────────────────────
# Space-Track fetch
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_from_space_track() -> str | None:
    """Login to Space-Track and fetch active TLEs. Returns raw TLE text or None."""
    identity = os.getenv("SPACE_TRACK_IDENTITY")
    password = os.getenv("SPACE_TRACK_PASSWORD")

    with httpx.Client(follow_redirects=True, timeout=60.0) as client:
        # Authenticate
        resp = client.post(ST_LOGIN, data={
            "identity": identity,
            "password": password,
        })
        if resp.status_code != 200:
            logger.error(f"[Space-Track] Login failed: {resp.status_code}")
            return None
        if "Failed" in resp.text or "Invalid" in resp.text:
            logger.error("[Space-Track] Invalid credentials.")
            return None

        # Fetch TLEs
        tle_resp = client.get(ST_TLE_URL)
        tle_resp.raise_for_status()
        tle_text = tle_resp.text

        # Logout politely
        try:
            client.get(ST_LOGOUT)
        except Exception:
            pass

        return tle_text


# ─────────────────────────────────────────────────────────────────────────────
# CelesTrak fallback fetch
# ─────────────────────────────────────────────────────────────────────────────

def _fetch_from_celestrak() -> str | None:
    """Fallback: fetch active TLEs from CelesTrak (no auth needed)."""
    try:
        r = httpx.get(CELESTRAK_FALLBACK, timeout=60.0)
        r.raise_for_status()
        logger.info("[Space-Track] Using CelesTrak fallback for TLEs.")
        return r.text
    except Exception as exc:
        logger.error(f"[CelesTrak Fallback] Error: {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def fetch_and_store_tle(db: Session) -> int:
    """
    Fetch active satellite TLEs from Space-Track (or CelesTrak fallback)
    and upsert into the DB. Returns number of satellites stored.
    """
    if _credentials_configured():
        logger.info("[Space-Track] Fetching TLEs from Space-Track.org...")
        tle_text = _fetch_from_space_track()
    else:
        logger.warning(
            "[Space-Track] Credentials not set — falling back to CelesTrak."
        )
        tle_text = _fetch_from_celestrak()

    if not tle_text:
        logger.error("[Space-Track] No TLE data retrieved.")
        return 0

    triples = _parse_tle_text(tle_text)
    logger.info(f"[Space-Track] Parsed {len(triples)} TLE entries.")
    count = _upsert_satellites(db, triples)
    logger.info(f"[Space-Track] {count} satellites upserted.")
    return count


def get_iss_tle() -> tuple[str, str] | None:
    """Return the latest ISS TLE (line1, line2) from Space-Track or CelesTrak."""
    iss_url = (
        "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle"
    )
    try:
        r = httpx.get(iss_url, timeout=15.0)
        r.raise_for_status()
        lines = [l.strip() for l in r.text.strip().split("\n") if l.strip()]
        if len(lines) >= 3:
            return lines[1], lines[2]
    except Exception as exc:
        logger.error(f"[ISS TLE] {exc}")
    return None



