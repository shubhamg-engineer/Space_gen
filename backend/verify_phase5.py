"""
Verify all SIP Phase 5 updates are working:
1. LL2 in_space filter (correct astronaut data)
2. NOAA space weather fallback
3. Launch Library previous launches
"""
import httpx

LL2_HEADERS = {"User-Agent": "SIP/1.0 (space-intelligence-platform)"}

print("=" * 55)
print("1. LL2 ASTRONAUT - in_space=true filter")
print("=" * 55)
try:
    r = httpx.get(
        "https://ll.thespacedevs.com/2.2.0/astronaut/",
        params={"in_space": "true", "limit": 20},
        headers=LL2_HEADERS,
        timeout=15.0
    )
    r.raise_for_status()
    d = r.json()
    print(f"  HTTP Status: {r.status_code}")
    print(f"  Total in space: {d.get('count')}")
    for p in d.get("results", []):
        agency = p.get("agency", {})
        agency_name = agency.get("name") if agency else "N/A"
        print(f"  - {p['name']} ({agency_name})")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 55)
print("2. NOAA SWPC KP Index (fallback)")
print("=" * 55)
try:
    r = httpx.get(
        "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
        timeout=10.0
    )
    r.raise_for_status()
    data = r.json()
    latest = data[-1] if len(data) > 1 else None
    print(f"  HTTP Status: {r.status_code}")
    print(f"  Rows returned: {len(data)}")
    print(f"  Latest KP row: {latest}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 55)
print("3. NOAA Solar Wind Plasma")
print("=" * 55)
try:
    r = httpx.get(
        "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json",
        timeout=10.0
    )
    r.raise_for_status()
    data = r.json()
    latest = data[-1] if len(data) > 1 else None
    print(f"  HTTP Status: {r.status_code}")
    print(f"  Latest plasma row (density, speed): {latest}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 55)
print("4. LL2 Previous Launches (international coverage)")
print("=" * 55)
try:
    r = httpx.get(
        "https://ll.thespacedevs.com/2.2.0/launch/previous/",
        params={"limit": 10, "mode": "detailed"},
        headers=LL2_HEADERS,
        timeout=20.0
    )
    r.raise_for_status()
    d = r.json()
    print(f"  HTTP Status: {r.status_code}")
    print(f"  Total previous launches: {d.get('count')}")
    for launch in d.get("results", [])[:10]:
        agency = launch.get("launch_service_provider", {})
        agency_name = agency.get("name", "N/A") if agency else "N/A"
        status = launch.get("status", {}).get("abbrev", "?")
        print(f"  - [{status}] {launch['name']} | {agency_name}")
except Exception as e:
    print(f"  ERROR: {e}")

print()
print("=" * 55)
print("5. TypeScript build check (frontend)")
print("=" * 55)
print("  Run: cd frontend && npm run build")
