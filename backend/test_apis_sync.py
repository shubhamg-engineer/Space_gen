import httpx

def test_open_notify():
    try:
        r = httpx.get("http://api.open-notify.org/astros.json")
        print("Open Notify:", r.json())
    except Exception as e:
        print("Open Notify Error:", e)

def test_nasa_donki():
    try:
        r = httpx.get("https://api.nasa.gov/DONKI/GST?startDate=2026-05-05&endDate=2026-05-12&api_key=DEMO_KEY")
        print("NASA DONKI GST:", r.status_code, r.text[:200])
    except Exception as e:
        print("NASA DONKI Error:", e)

test_open_notify()
test_nasa_donki()
