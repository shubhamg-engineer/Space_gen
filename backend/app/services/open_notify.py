"""Open Notify API — people in space and ISS position."""
import httpx

LL2_ASTRONAUT_URL = "https://ll.thespacedevs.com/2.2.0/astronaut/?in_space=true&limit=20"
ISS_URL = "http://api.open-notify.org/iss-now.json"

def get_people_in_space() -> dict | None:
    """Return count and list of people currently in space using LL2."""
    try:
        r = httpx.get(LL2_ASTRONAUT_URL, timeout=15.0, headers={"User-Agent": "SIP/1.0"})
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        
        people = []
        for person in results:
            # Use agency name as the craft/station proxy.
            # LL2 in_space=true returns only people currently in space.
            agency = person.get("agency") or {}
            people.append({
                "name": person.get("name"),
                "craft": agency.get("name", "In Space"),
            })

        return {"count": data.get("count", len(people)), "people": people, "source": "Launch Library 2"}
    except Exception as exc:
        print(f"[LL2] Astronaut error: {exc}")
        return None


def get_iss_position() -> dict:
    """Return current ISS lat/lon."""
    try:
        r = httpx.get(ISS_URL, timeout=10.0)
        r.raise_for_status()
        data = r.json()
        pos = data.get("iss_position", {})
        return {
            "latitude": float(pos.get("latitude", 0)),
            "longitude": float(pos.get("longitude", 0)),
            "timestamp": data.get("timestamp"),
            "velocity_km_s": 7.66,  # average ISS orbital speed
            "altitude_km": 408.0,   # average ISS altitude
        }
    except Exception as exc:
        print(f"[OpenNotify] ISS error: {exc}")
        return {}
