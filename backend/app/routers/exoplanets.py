"""Exoplanets router — Deep Space Explorer."""
from fastapi import APIRouter
from app.services.nasa_exoplanets import get_recent_exoplanets
from app.services.groq_ai import generate_explanation
from fastapi_cache.decorator import cache

router = APIRouter()

@router.get("/")
@cache(expire=3600)
def get_exoplanets(limit: int = 50):
    """List recently discovered exoplanets from NASA Exoplanet Archive."""
    data = get_recent_exoplanets(limit=limit)
    return data

@router.get("/{planet_name}/explain")
@cache(expire=86400)
def explain_exoplanet(planet_name: str):
    """Generate an AI explanation of an exoplanet based on its name."""
    topic = f"Explain what we know about the exoplanet {planet_name}."
    context = "Provide scientific facts about this exoplanet, its discovery, host star, and potential habitability characteristics if known."
    explanation = generate_explanation(topic=topic, context=context, level="general")
    return explanation
