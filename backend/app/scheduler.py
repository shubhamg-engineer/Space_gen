"""APScheduler background job scheduler."""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.database import SessionLocal
from app.services import space_track, nasa_api, spacex_api, news_rss, open_notify
from app import models
import logging

logger = logging.getLogger("sip.scheduler")

scheduler = BackgroundScheduler(timezone="UTC")


def _job_tle_sync():
    """Sync satellite TLEs from Space-Track.org (or CelesTrak fallback)."""
    db = SessionLocal()
    try:
        count = space_track.fetch_and_store_tle(db)
        logger.info(f"[Scheduler] TLE sync: {count} satellites updated")
    finally:
        db.close()


def _job_launch_sync():
    """Sync upcoming global launches from Launch Library 2."""
    from app.services import launch_library
    db = SessionLocal()
    try:
        count = launch_library.sync_upcoming_launches(db)
        logger.info(f"[Scheduler] Launch sync: {count} launches updated")
    finally:
        db.close()


def _job_weather_sync():
    """Sync space weather from NASA DONKI."""
    db = SessionLocal()
    try:
        result = nasa_api.sync_space_weather(db)
        logger.info(f"[Scheduler] Space weather: KP={result.get('kp_index')} Storm={result.get('storm_level')}")
    finally:
        db.close()


def _job_news_sync():
    """Sync latest space news from Spaceflight News API."""
    db = SessionLocal()
    try:
        count = news_rss.sync_news(db)
        logger.info(f"[Scheduler] News sync: {count} new articles")
    finally:
        db.close()


def _job_spacex_rockets_sync():
    """Sync SpaceX rocket specs (daily is sufficient)."""
    db = SessionLocal()
    try:
        count = spacex_api.sync_spacex_rockets(db)
        logger.info(f"[Scheduler] SpaceX rockets: {count} synced")
    finally:
        db.close()


def _job_spacex_failures_sync():
    """Sync SpaceX mission failures into the failures table."""
    db = SessionLocal()
    try:
        count = spacex_api.sync_spacex_failures(db)
        logger.info(f"[Scheduler] SpaceX failures: {count} new records")
    finally:
        db.close()


def sync_astronauts_job():
    """Sync current ISS crew from Open Notify (hourly)."""
    logger.info("[Scheduler] Starting astronaut sync...")
    db = SessionLocal()
    try:
        data = open_notify.get_people_in_space()
        if data:
            for person in data.get("people", []):
                name = person.get("name", "")
                craft = person.get("craft", "ISS")
                existing = db.query(models.Astronaut).filter(models.Astronaut.name.ilike(name)).first()
                if not existing:
                    new_astro = models.Astronaut(name=name, current_location=craft, status="active")
                    db.add(new_astro)
            db.commit()
    except Exception as e:
        logger.error(f"[Scheduler] Astronaut sync failed: {e}")
    finally:
        db.close()


def start_scheduler():
    """Register all background jobs and start the scheduler."""
    # TLE data — every 6 hours (Space-Track or CelesTrak fallback)
    scheduler.add_job(_job_tle_sync, IntervalTrigger(hours=6), id="tle_sync",
                      replace_existing=True, misfire_grace_time=300)

    # Launch data — every 10 minutes (Launch Library 2)
    scheduler.add_job(_job_launch_sync, IntervalTrigger(minutes=10), id="launch_sync",
                      replace_existing=True, misfire_grace_time=60)

    # Space weather — every 5 minutes (NASA DONKI)
    scheduler.add_job(_job_weather_sync, IntervalTrigger(minutes=5), id="weather_sync",
                      replace_existing=True, misfire_grace_time=60)

    # News — every 15 minutes (Spaceflight News API)
    scheduler.add_job(_job_news_sync, IntervalTrigger(minutes=15), id="news_sync",
                      replace_existing=True, misfire_grace_time=120)

    # SpaceX rockets — once a day (data rarely changes)
    scheduler.add_job(_job_spacex_rockets_sync, IntervalTrigger(hours=24),
                      id="spacex_rockets_sync", replace_existing=True,
                      misfire_grace_time=600)

    # SpaceX failures — every 6 hours
    scheduler.add_job(_job_spacex_failures_sync, IntervalTrigger(hours=6),
                      id="spacex_failures_sync", replace_existing=True,
                      misfire_grace_time=600)

    # Astronauts — every hour
    scheduler.add_job(sync_astronauts_job, IntervalTrigger(hours=1),
                      id="sync_astronauts", replace_existing=True,
                      misfire_grace_time=600)

    scheduler.start()
    logger.info("[Scheduler] All background jobs started (NOAA→NASA DONKI, CelesTrak→Space-Track, +SpaceX)")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("[Scheduler] Stopped")

