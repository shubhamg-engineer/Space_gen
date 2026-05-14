from app.services.nasa_api import get_apod, get_asteroids_today
from app.services.spacex_api import get_next_launch, get_all_rockets

print("=== APOD ===")
apod = get_apod()
if apod:
    print(f"  Title: {apod.get('title')}")
    print(f"  Date:  {apod.get('date')}")
    print(f"  Media: {apod.get('media_type')}")
else:
    print("  APOD returned None")

print()
print("=== Near Earth Asteroids (next 3 days) ===")
asteroids = get_asteroids_today()
print(f"  Found {len(asteroids)} asteroids")
if asteroids:
    a = asteroids[0]
    print(f"  Closest: {a['name']}")
    print(f"  Miss distance: {a['miss_distance_km']:,.0f} km")
    print(f"  Potentially hazardous: {a['is_potentially_hazardous']}")

print()
print("=== SpaceX Next Launch ===")
launch = get_next_launch()
if launch:
    print(f"  Name: {launch.get('name')}")
    print(f"  Date: {launch.get('date_utc')}")
else:
    print("  No upcoming launch data")

print()
print("=== SpaceX Rockets ===")
rockets = get_all_rockets()
print(f"  Total rockets: {len(rockets)}")
for r in rockets:
    print(f"  - {r.get('name')} ({'Active' if r.get('active') else 'Retired'})")
