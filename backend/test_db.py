import sys
import traceback

def run():
    try:
        from app.database import Base, engine, SessionLocal
        from app.models import Asteroid, SpaceEconomy, SustainabilityScore
        
        print("Imported models successfully.")
        
        Base.metadata.create_all(bind=engine)
        print("Tables created.")
        
        db = SessionLocal()
        count = db.query(Asteroid).count()
        print(f"Asteroids count: {count}")
        db.close()
        
    except Exception as e:
        print("Error occurred:")
        traceback.print_exc()

if __name__ == "__main__":
    run()
