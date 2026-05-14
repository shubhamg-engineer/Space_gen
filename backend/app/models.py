from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, Date
from sqlalchemy.sql import func
from app.database import Base


class Satellite(Base):
    __tablename__ = "satellites"
    id = Column(Integer, primary_key=True, index=True)
    norad_id = Column(Integer, unique=True, index=True)
    name = Column(String, index=True)
    cospar_id = Column(String, nullable=True)
    country_of_origin = Column(String, nullable=True)
    operator = Column(String, nullable=True)
    orbit_type = Column(String, nullable=True)  # LEO, MEO, GEO, HEO, SSO
    altitude_apogee_km = Column(Float, nullable=True)
    altitude_perigee_km = Column(Float, nullable=True)
    inclination = Column(Float, nullable=True)
    period = Column(Float, nullable=True)
    status = Column(String, nullable=True)
    launch_date = Column(String, nullable=True)
    mission_type = Column(String, nullable=True)
    mass_kg = Column(Float, nullable=True)
    tle_line1 = Column(String, nullable=True)
    tle_line2 = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Mission(Base):
    __tablename__ = "missions"
    id = Column(Integer, primary_key=True, index=True)
    ll2_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, index=True)
    agency = Column(String, nullable=True)
    launch_vehicle = Column(String, nullable=True)
    launch_date = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    status = Column(String, nullable=True)  # active, complete, failed, in-transit
    mission_type = Column(String, nullable=True)  # crewed, uncrewed, planetary
    description = Column(Text, nullable=True)
    webcast_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Rocket(Base):
    __tablename__ = "rockets"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, index=True)
    operator = Column(String, nullable=True)
    country = Column(String, nullable=True)
    height_m = Column(Float, nullable=True)
    diameter_m = Column(Float, nullable=True)
    mass_kg = Column(Float, nullable=True)
    leo_capacity_kg = Column(Float, nullable=True)
    gto_capacity_kg = Column(Float, nullable=True)
    propellant_stage1 = Column(String, nullable=True)
    propellant_stage2 = Column(String, nullable=True)
    engine_stage1 = Column(String, nullable=True)
    engine_stage2 = Column(String, nullable=True)
    thrust_kn = Column(Float, nullable=True)
    isp_vacuum_s = Column(Float, nullable=True)
    stages = Column(Integer, nullable=True)
    reusable = Column(Boolean, default=False)
    first_flight = Column(String, nullable=True)
    total_launches = Column(Integer, default=0)
    total_successes = Column(Integer, default=0)
    status = Column(String, nullable=True)  # active, retired, development
    description = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Launch(Base):
    """Upcoming and recent launches from Launch Library 2."""
    __tablename__ = "launches"
    id = Column(Integer, primary_key=True, index=True)
    ll2_id = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, index=True)
    vehicle = Column(String, nullable=True)
    agency = Column(String, nullable=True)
    net = Column(String, nullable=True)           # No Earlier Than (ISO datetime)
    window_start = Column(String, nullable=True)
    window_end = Column(String, nullable=True)
    status_abbrev = Column(String, nullable=True)  # Go / TBD / Success / Failure
    status_name = Column(String, nullable=True)
    mission_type = Column(String, nullable=True)
    orbit = Column(String, nullable=True)
    payload_name = Column(String, nullable=True)
    launch_site = Column(String, nullable=True)
    webcast_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    mission_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Failure(Base):
    __tablename__ = "failures"
    id = Column(Integer, primary_key=True, index=True)
    mission_name = Column(String, index=True)
    date = Column(String, nullable=True)
    agency = Column(String, nullable=True)
    vehicle = Column(String, nullable=True)
    failure_phase = Column(String, nullable=True)  # ascent, separation, orbit, re-entry, pad
    primary_cause = Column(String, nullable=True)
    root_cause_category = Column(String, nullable=True)  # software, structural, thermal, human_error, propulsion
    failure_mode_detail = Column(Text, nullable=True)
    outcome = Column(String, nullable=True)  # total_loss, partial_loss, crew_survived, crew_lost
    crew_involved = Column(Boolean, default=False)
    severity = Column(String, nullable=True)  # minor, major, catastrophic
    investigation_report_url = Column(String, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    corrective_actions = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Astronaut(Base):
    __tablename__ = "astronauts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    nationality = Column(String, nullable=True)
    agency = Column(String, nullable=True)
    status = Column(String, nullable=True)  # active, retired, deceased
    total_missions = Column(Integer, default=0)
    total_time_in_space_hours = Column(Float, default=0.0)
    total_eva_count = Column(Integer, default=0)
    total_eva_hours = Column(Float, default=0.0)
    current_location = Column(String, nullable=True)  # ISS, Earth, vehicle
    profile_image_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SpaceWeather(Base):
    """Cache table for the latest space weather snapshot."""
    __tablename__ = "space_weather"
    id = Column(Integer, primary_key=True, index=True)
    kp_index = Column(Float, nullable=True)
    solar_wind_speed = Column(Float, nullable=True)
    solar_wind_density = Column(Float, nullable=True)
    bz_component = Column(Float, nullable=True)
    x_ray_flux = Column(Float, nullable=True)
    proton_flux = Column(Float, nullable=True)
    storm_level = Column(String, nullable=True)  # G0-G5
    aurora_visibility = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)
    fetched_at = Column(DateTime, server_default=func.now())


class NewsArticle(Base):
    __tablename__ = "news_articles"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    url = Column(String, unique=True)
    source = Column(String, nullable=True)
    published_at = Column(String, nullable=True)
    summary = Column(Text, nullable=True)         # AI-generated 2-sentence summary
    image_url = Column(String, nullable=True)
    category = Column(String, nullable=True)      # Launch / Science / Commercial / Policy
    created_at = Column(DateTime, server_default=func.now())


class OwnerNote(Base):
    __tablename__ = "owner_notes"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    tags = Column(String, nullable=True)          # comma-separated (SQLite compat)
    linked_module = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CommunityIdea(Base):
    __tablename__ = "community_ideas"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, nullable=True)      # Visualization / Failure Analysis / UI / Feature / Bug
    submitter_email = Column(String, nullable=True)
    status = Column(String, default="pending")   # pending, approved, rejected, in_progress, implemented
    vote_count = Column(Integer, default=0)
    owner_comment = Column(Text, nullable=True)
    pinned = Column(Boolean, default=False)
    ip_hash = Column(String, nullable=True)       # SHA-256 hashed IP
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Asteroid(Base):
    """Module 6.19 - NEO Monitor"""
    __tablename__ = "asteroids"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    close_approach_date = Column(String, nullable=True)
    miss_distance_km = Column(Float, nullable=True)
    relative_velocity_kmh = Column(Float, nullable=True)
    estimated_diameter_min_m = Column(Float, nullable=True)
    estimated_diameter_max_m = Column(Float, nullable=True)
    is_potentially_hazardous = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


class SpaceEconomy(Base):
    """Module 6.21 - Space Economy & Market Intelligence"""
    __tablename__ = "space_economy"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    funding_round = Column(String, nullable=True)
    amount_raised_millions = Column(Float, nullable=True)
    valuation_millions = Column(Float, nullable=True)
    date_announced = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class SustainabilityScore(Base):
    """Module 6.24 - Space Law & Sustainability"""
    __tablename__ = "sustainability_scores"
    id = Column(Integer, primary_key=True, index=True)
    satellite_norad_id = Column(Integer, unique=True, index=True)
    operator = Column(String, nullable=True)
    oss_score = Column(Float, nullable=True)  # 0.0 to 100.0
    debris_mitigation_rating = Column(String, nullable=True)
    collision_avoidance_rating = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
