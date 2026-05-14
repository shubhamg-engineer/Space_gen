"""Spaceflight News API v2 — RSS-style news aggregation."""
import httpx
from sqlalchemy.orm import Session
from app import models
from app.services.groq_ai import summarize_article

SNAPI_BASE = "https://api.spaceflightnewsapi.net/v4"


def sync_news(db: Session, limit: int = 20) -> int:
    """Fetch latest articles and upsert into DB."""
    try:
        r = httpx.get(f"{SNAPI_BASE}/articles/", params={"limit": limit, "_sort": "publishedAt:DESC"},
                      timeout=20.0)
        r.raise_for_status()
        data = r.json()
        articles = data.get("results", [])
        count = 0
        for item in articles:
            url = item.get("url", "")
            if not url:
                continue
            existing = db.query(models.NewsArticle).filter(models.NewsArticle.url == url).first()
            if existing:
                continue
            summary = summarize_article(item.get("title", ""), item.get("summary", ""))
            article = models.NewsArticle(
                title=item.get("title", "Untitled"),
                url=url,
                source=item.get("newsSite"),
                published_at=item.get("publishedAt"),
                summary=summary,
                image_url=item.get("imageUrl"),
                category=_classify_article(item.get("title", "")),
            )
            db.add(article)
            count += 1
        db.commit()
        return count
    except Exception as exc:
        print(f"[NewsAPI] Error: {exc}")
        return 0


def _classify_article(title: str) -> str:
    title_lower = title.lower()
    if any(w in title_lower for w in ["launch", "liftoff", "rocket", "falcon", "ariane", "soyuz"]):
        return "Launch News"
    if any(w in title_lower for w in ["discovery", "science", "research", "study", "telescope", "jwst", "webb"]):
        return "Science Discovery"
    if any(w in title_lower for w in ["spacex", "blue origin", "rocket lab", "virgin", "commercial"]):
        return "Commercial Space"
    if any(w in title_lower for w in ["nasa", "esa", "roscosmos", "isro", "jaxa", "budget", "policy", "congress"]):
        return "Policy & Funding"
    if any(w in title_lower for w in ["failure", "anomaly", "explosion", "abort", "crash"]):
        return "Failure & Anomaly"
    return "Mission Update"
