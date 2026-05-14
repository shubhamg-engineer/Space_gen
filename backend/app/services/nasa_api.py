"""
NASA Open APIs integration.
Covers:
  - DONKI (Space Weather: CME, GST, Solar Flares)  → replaces noaa_swpc.py
  - NeoWs (Near-Earth Objects / Asteroids)          → NEW
  - APOD  (Astronomy Picture of the Day)            → NEW
Docs: https://api.nasa.gov
"""
import os
import httpx
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app import models
import logging

logger = logging.getLogger("sip.nasa")

NASA_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
NASA_BASE = "https://api.nasa.gov"


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _get(endpoint: str, params: dict | None = None) -> dict | list | None:
    """GET a NASA API endpoint; returns parsed JSON or None on error."""
    p = {"api_key": NASA_KEY}
    if params:
        p.update(params)
    try:
        r = httpx.get(f"{NASA_BASE}{endpoint}", params=p, timeout=20.0)
        r.raise_for_status()
        return r.json()
    except Exception as exc:
        logger.error(f"[NASA] {endpoint} → {exc}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# DONKI — Space Weather
# ─────────────────────────────────────────────────────────────────────────────

def _donki_get(resource: str, days_back: int = 7) -> list:
    """Fetch DONKI resource for the past N days."""
    end = date.today()
    start = end - timedelta(days=days_back)
    data = _get(f"/DONKI/{resource}", {
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
    })
    return data if isinstance(data, list) else []


def _gst_to_kp(gst_list: list) -> float | None:
    """Extract highest KP index from a GST response."""
    kp_values = []
    for event in gst_list:
        for obs in event.get("allKpIndex", []):
            try:
                kp_values.append(float(obs.get("kpIndex", 0)))
            except (ValueError, TypeError):
                pass
    return max(kp_values) if kp_values else None


def _kp_to_storm_level(kp: float) -> str:
    if kp < 4:   return "G0 (Quiet)"
    if kp < 5:   return "G0 (Active)"
    if kp < 6:   return "G1 (Minor)"
    if kp < 7:   return "G2 (Moderate)"
    if kp < 8:   return "G3 (Strong)"
    if kp < 9:   return "G4 (Severe)"
    return "G5 (Extreme)"


def _kp_to_aurora(kp: float) -> str:
    if kp < 4:  return "Aurora only at high latitudes (>65°)"
    if kp < 5:  return "Aurora visible at latitudes >60°"
    if kp < 6:  return "Aurora visible at latitudes >55° (northern Canada, Scandinavia)"
    if kp < 7:  return "Aurora visible at latitudes >50° (UK, northern US)"
    if kp < 8:  return "Aurora visible at latitudes >45° (central Europe, northern states)"
    return "Aurora potentially visible at mid-latitudes (<40°)"


def _get_noaa_kp() -> float | None:
    """Fallback: Fetch current KP index directly from NOAA SWPC JSON feed."""
    try:
        url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
        r = httpx.get(url, timeout=10.0)
        r.raise_for_status()
        data = r.json()
        if len(data) > 1:
            # The feed returns a list of dicts with key 'Kp'
            latest_row = data[-1]
            if isinstance(latest_row, dict):
                return float(latest_row.get("Kp", 0))
            elif isinstance(latest_row, list):
                # Some endpoints return arrays: [time_tag, kp, ...]
                return float(latest_row[1])
    except Exception as exc:
        logger.error(f"[NOAA SWPC] Fallback KP error: {exc}")
    return None

def _get_noaa_solar_wind() -> tuple[float | None, float | None]:
    """Fallback: Fetch current solar wind speed and density from NOAA."""
    try:
        url = "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json"
        r = httpx.get(url, timeout=10.0)
        r.raise_for_status()
        data = r.json()
        if len(data) > 1:
            latest_row = data[-1]
            density = float(latest_row[1]) if latest_row[1] else None
            speed = float(latest_row[2]) if latest_row[2] else None
            return speed, density
    except Exception as exc:
        logger.error(f"[NOAA SWPC] Fallback Solar Wind error: {exc}")
    return None, None

def _get_noaa_mag() -> float | None:
    """Fallback: Fetch current Bz component from NOAA."""
    try:
        url = "https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json"
        r = httpx.get(url, timeout=10.0)
        r.raise_for_status()
        data = r.json()
        if len(data) > 1:
            latest_row = data[-1]
            bz = float(latest_row[3]) if latest_row[3] else None
            return bz
    except Exception as exc:
        logger.error(f"[NOAA SWPC] Fallback Mag error: {exc}")
    return None

def sync_space_weather(db: Session) -> dict:
    """
    Fetch space weather data from NASA DONKI (GST + CME + FLR)
    and upsert the latest snapshot into the DB. Uses NOAA fallback if needed.
    """
    gst_data = _donki_get("GST", days_back=7)
    cme_data = _donki_get("CME", days_back=3)
    flr_data = _donki_get("FLR", days_back=7)

    kp = _gst_to_kp(gst_data)
    
    # --- NOAA Fallbacks ---
    if kp is None:
        kp = _get_noaa_kp()
        
    sw_speed, sw_density = _get_noaa_solar_wind()
    bz = _get_noaa_mag()
    # ----------------------

    # Build AI-friendly summary strings
    cme_count = len(cme_data)
    flr_count = len(flr_data)
    storm = _kp_to_storm_level(kp) if kp is not None else "Unknown"
    aurora = _kp_to_aurora(kp) if kp is not None else "Unknown"

    ai_summary = (
        f"Current geomagnetic activity: {storm}. "
        f"{cme_count} Coronal Mass Ejection(s) recorded in the last 3 days. "
        f"{flr_count} Solar Flare(s) detected in the last 7 days. "
        f"Aurora forecast: {aurora}."
    )

    snapshot = models.SpaceWeather(
        kp_index=kp,
        solar_wind_speed=sw_speed,
        solar_wind_density=sw_density,
        bz_component=bz,
        storm_level=storm,
        aurora_visibility=aurora,
        ai_summary=ai_summary,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    logger.info(f"[Space Weather] Synced — KP={kp}, Storm={storm}")
    return {
        "kp_index": kp,
        "solar_wind_speed": sw_speed,
        "solar_wind_density": sw_density,
        "bz_component": bz,
        "storm_level": storm,
        "aurora_visibility": aurora,
        "cme_count_3d": cme_count,
        "solar_flare_count_7d": flr_count,
        "ai_summary": ai_summary,
    }


def get_solar_events_summary(days_back: int = 7) -> dict:
    """Return CME, GST, and Solar Flare event lists for the past N days."""
    return {
        "cme":    _donki_get("CME", days_back),
        "gst":    _donki_get("GST", days_back),
        "flares": _donki_get("FLR", days_back),
    }


# ─────────────────────────────────────────────────────────────────────────────
# NeoWs — Near Earth Objects (Asteroids)
# ─────────────────────────────────────────────────────────────────────────────

def get_asteroids_today() -> list[dict]:
    """
    Return near-Earth asteroids approaching within the next 3 days.
    Each dict includes name, diameter, speed, miss distance, and hazard flag.
    """
    start = date.today()
    end = start + timedelta(days=3)
    data = _get("/neo/rest/v1/feed", {
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
    })
    if not data:
        return []

    results = []
    neo_dict = data.get("near_earth_objects", {})
    for day_key, neos in neo_dict.items():
        for neo in neos:
            try:
                diameter_km = (
                    neo["estimated_diameter"]["kilometers"]["estimated_diameter_max"]
                )
                approach = neo["close_approach_data"][0]
                results.append({
                    "id": neo.get("id"),
                    "name": neo.get("name"),
                    "date": day_key,
                    "is_potentially_hazardous": neo.get("is_potentially_hazardous_asteroid", False),
                    "estimated_diameter_km": round(diameter_km, 4),
                    "relative_velocity_km_s": round(
                        float(approach["relative_velocity"]["kilometers_per_second"]), 3
                    ),
                    "miss_distance_km": round(
                        float(approach["miss_distance"]["kilometers"]), 0
                    ),
                    "orbiting_body": approach.get("orbiting_body", "Earth"),
                    "nasa_jpl_url": neo.get("nasa_jpl_url"),
                })
            except (KeyError, IndexError, ValueError):
                continue

    results.sort(key=lambda x: x["miss_distance_km"])
    return results


def get_asteroid_by_id(asteroid_id: str) -> dict | None:
    """Return detailed data for a single asteroid by NASA ID."""
    return _get(f"/neo/rest/v1/neo/{asteroid_id}")


# ─────────────────────────────────────────────────────────────────────────────
# APOD — Astronomy Picture of the Day
# ─────────────────────────────────────────────────────────────────────────────

def get_apod(count: int = 1) -> dict | list | None:
    """
    Return today's Astronomy Picture of the Day.
    If count > 1, returns a list of random APODs.
    """
    if count == 1:
        return _get("/planetary/apod")
    return _get("/planetary/apod", {"count": count})
