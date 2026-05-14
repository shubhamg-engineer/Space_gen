from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import Asteroid, SpaceEconomy, SustainabilityScore

client = TestClient(app)

def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already seeded to avoid duplicates
    if db.query(Asteroid).count() == 0:
        a = Asteroid(name="Apophis", close_approach_date="2029-04-13", miss_distance_km=31000, is_potentially_hazardous=True)
        db.add(a)
    
    if db.query(SpaceEconomy).count() == 0:
        e = SpaceEconomy(company_name="SpaceX", funding_round="Series Z", amount_raised_millions=750.0, valuation_millions=137000.0)
        db.add(e)
        
    if db.query(SustainabilityScore).count() == 0:
        s = SustainabilityScore(satellite_norad_id=12345, operator="Planet", oss_score=92.5, debris_mitigation_rating="A")
        db.add(s)
        
    db.commit()
    db.close()

def test_asteroids_api():
    response = client.get("/api/v1/nextgen/asteroids")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(a["name"] == "Apophis" for a in data)
    print("[PASS] /api/v1/nextgen/asteroids PASSED")

def test_economy_api():
    response = client.get("/api/v1/nextgen/economy/funding")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(e["company_name"] == "SpaceX" for e in data)
    print("[PASS] /api/v1/nextgen/economy/funding PASSED")

def test_sustainability_api():
    response = client.get("/api/v1/nextgen/sustainability")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s["operator"] == "Planet" for s in data)
    print("[PASS] /api/v1/nextgen/sustainability PASSED")

if __name__ == "__main__":
    setup_db()
    test_asteroids_api()
    test_economy_api()
    test_sustainability_api()
    print("All tests passed successfully!")
