from datetime import datetime, timedelta


def test_health(client):
    assert client.get("/api/health").get_json() == {"status": "ok"}


def test_meta_lists_cities_and_species(client):
    body = client.get("/api/meta").get_json()
    assert len(body["cities"]) == 14
    assert {"name": "Marsh tick", "latinName": "Ixodes apronophorus"} in body["species"]


def test_list_and_filter(client):
    assert client.get("/api/sightings").get_json()["total"] == 3
    assert client.get("/api/sightings?city=london").get_json()["total"] == 2
    assert client.get("/api/sightings?species=Marsh%20tick").get_json()["total"] == 2
    # end date is inclusive
    body = client.get("/api/sightings?start=2024-01-10&end=2024-01-20").get_json()
    assert body["total"] == 2
    # newest first
    assert body["results"][0]["id"] == "a2"


def test_pagination(client):
    body = client.get("/api/sightings?limit=1&offset=1").get_json()
    assert body["total"] == 3 and len(body["results"]) == 1


def test_bad_filters_return_400(client):
    resp = client.get("/api/sightings?start=yesterday&city=Atlantis&limit=0")
    assert resp.status_code == 400
    details = resp.get_json()["details"]
    assert "start" in details or "limit" in details


def test_get_single_and_404(client):
    assert client.get("/api/sightings/a1").get_json()["location"] == "London"
    resp = client.get("/api/sightings/nope")
    assert resp.status_code == 404 and resp.get_json() == {"error": "Sighting not found"}


def test_regions_include_zero_counts(client):
    results = client.get("/api/stats/regions").get_json()["results"]
    assert len(results) == 14
    assert results[0] == {"city": "London", "lat": 51.5072, "lng": -0.1276,
                          "count": 2, "latest": "2024-01-20T10:00:00"}
    assert next(r for r in results if r["city"] == "Cardiff")["count"] == 0


def test_trends_monthly_and_weekly(client):
    monthly = client.get("/api/stats/trends?interval=month").get_json()["results"]
    assert monthly == [{"period": "2024-01", "count": 2}, {"period": "2024-03", "count": 1}]
    weekly = client.get("/api/stats/trends?interval=week&city=London").get_json()
    assert sum(r["count"] for r in weekly["results"]) == 2
    assert client.get("/api/stats/trends?interval=day").status_code == 400


def test_create_sighting(client):
    resp = client.post("/api/sightings", json={
        "date": "2025-06-01T14:30", "location": "Leeds",
        "species": "Passerine tick", "notes": "  On my dog  "})
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["latinName"] == "Dermacentor frontalis"
    assert body["source"] == "user" and body["notes"] == "On my dog"
    assert client.get(f"/api/sightings/{body['id']}").status_code == 200
    assert client.get("/api/sightings?city=Leeds").get_json()["total"] == 2


def test_create_sighting_validation(client):
    future = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    resp = client.post("/api/sightings", json={
        "date": future, "location": "Atlantis", "species": "", "notes": "x" * 501})
    assert resp.status_code == 400
    details = resp.get_json()["details"]
    assert set(details) == {"date", "location", "species", "notes"}


def test_create_sighting_requires_json(client):
    resp = client.post("/api/sightings", data="nope", content_type="text/plain")
    assert resp.status_code == 400


def test_unknown_route_is_json_404(client):
    resp = client.get("/api/does-not-exist")
    assert resp.status_code == 404 and "error" in resp.get_json()
