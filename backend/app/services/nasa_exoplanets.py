"""NASA Exoplanet Archive service."""
import httpx
import logging

logger = logging.getLogger("sip.exoplanets")

# NASA Exoplanet Archive TAP API (Table Access Protocol)
EXOPLANET_API_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

def get_recent_exoplanets(limit: int = 50) -> list:
    """Fetch recently discovered exoplanets."""
    try:
        # Query the PS (Planetary Systems) table for confirmed planets
        query = (
            "select top {} pl_name, hostname, discoverymethod, disc_year, "
            "pl_rade, pl_masse, pl_orbper, st_teff, sy_dist "
            "from ps "
            "where default_flag=1 "
            "order by disc_year desc".format(limit)
        )
        params = {
            "query": query,
            "format": "json"
        }
        r = httpx.get(EXOPLANET_API_URL, params=params, timeout=15.0)
        r.raise_for_status()
        data = r.json()
        
        results = []
        for row in data:
            results.append({
                "name": row.get("pl_name"),
                "host_star": row.get("hostname"),
                "discovery_method": row.get("discoverymethod"),
                "discovery_year": row.get("disc_year"),
                "radius_earth": row.get("pl_rade"),
                "mass_earth": row.get("pl_masse"),
                "orbital_period_days": row.get("pl_orbper"),
                "star_temp_k": row.get("st_teff"),
                "distance_pc": row.get("sy_dist"),
            })
        return results
    except Exception as exc:
        logger.error(f"[Exoplanets] Failed to fetch: {exc}")
        return []
