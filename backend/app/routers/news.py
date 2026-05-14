"""Space News router — Spaceflight News API articles."""
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app import models
from app.services.groq_ai import generate_daily_digest
from app.services.news_rss import sync_news
from app.services.groq_ai import generate_daily_digest
from fastapi_cache.decorator import cache

router = APIRouter()


@router.get("/")
@cache(expire=600)
def get_news(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List news articles, newest first."""
    q = db.query(models.NewsArticle)
    if category:
        q = q.filter(models.NewsArticle.category.ilike(f"%{category}%"))
    return q.order_by(models.NewsArticle.published_at.desc()).offset(skip).limit(limit).all()


@router.get("/today-digest")
def get_daily_digest(db: Session = Depends(get_db)):
    """Generate an AI-powered daily digest of top news."""
    top_articles = (
        db.query(models.NewsArticle)
        .order_by(models.NewsArticle.published_at.desc())
        .limit(5)
        .all()
    )
    if not top_articles:
        return {"digest": "No news available for today's digest."}
    
    articles_dict = [{"title": a.title} for a in top_articles]
    digest = generate_daily_digest(articles_dict)
    return {"digest": digest, "articles": articles_dict}


@router.post("/sync")
def trigger_news_sync(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Manually trigger a news article sync."""
    background_tasks.add_task(sync_news, db)
    return {"message": "News sync started."}


@router.get("/digest")
@cache(expire=3600)
def get_daily_digest(db: Session = Depends(get_db)):
    """Generate an AI 'Today in Space' digest from latest articles."""
    articles = (
        db.query(models.NewsArticle)
        .order_by(models.NewsArticle.published_at.desc())
        .limit(5)
        .all()
    )
    article_dicts = [{"title": a.title} for a in articles]
    digest = generate_daily_digest(article_dicts)
    return {"digest": digest, "article_count": len(articles)}


@router.get("/categories")
@cache(expire=3600)
def get_categories(db: Session = Depends(get_db)):
    """Return distinct article categories present in DB."""
    rows = db.query(models.NewsArticle.category).distinct().all()
    return {"categories": [r[0] for r in rows if r[0]]}
