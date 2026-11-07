import pytest
import requests

import db
import importer


def test_clean_records_skips_invalid_and_duplicates():
    records = [
        {"id": "x1", "date": "2023-05-01T08:00:00", "location": " london ",
         "species": "MARSH TICK", "latinName": "wrong"},
        {"id": "x1", "date": "2023-05-01T08:00:00", "location": "London",
         "species": "Marsh tick", "latinName": "Ixodes apronophorus"},  # duplicate
        {"id": "x2", "date": "not a date", "location": "London", "species": "Marsh tick"},
        {"id": "x3", "date": "2023-05-01T08:00:00", "location": "Atlantis", "species": "Marsh tick"},
        {"date": "2023-05-01T08:00:00", "location": "London", "species": "Marsh tick"},  # no id
        "garbage",
    ]
    rows, stats = importer.clean_records(records)
    assert stats == {"received": 6, "stored": 1, "skipped_invalid": 4, "duplicates": 1}
    assert rows[0]["location"] == "London"
    assert rows[0]["species"] == "Marsh tick"
    assert rows[0]["latin_name"] == "Ixodes apronophorus"  # corrected from reference


def test_reimport_is_idempotent(db_path, monkeypatch):
    data = [{"id": "y1", "date": "2023-01-01T00:00:00", "location": "Leeds",
             "species": "Marsh tick", "latinName": "Ixodes apronophorus"}]
    monkeypatch.setattr(importer, "fetch_sightings", lambda url: data)
    importer.run_import(db_path)
    importer.run_import(db_path)
    with db.connect(db_path) as conn:
        assert conn.execute("SELECT COUNT(*) FROM sightings").fetchone()[0] == 1


def test_api_failure_keeps_existing_data(db_path, monkeypatch):
    with db.connect(db_path) as conn:
        db.insert_sighting(conn, {"id": "keep", "date": "2023-01-01T00:00:00",
                                  "location": "Leeds", "species": "Marsh tick",
                                  "latin_name": "Ixodes apronophorus", "notes": None,
                                  "source": "elanco"})

    def boom(*args, **kwargs):
        raise requests.ConnectionError("down")

    monkeypatch.setattr(requests.Session, "get", boom)
    result = importer.run_import(db_path)
    assert result["ok"] is False
    with db.connect(db_path) as conn:
        assert conn.execute("SELECT COUNT(*) FROM sightings").fetchone()[0] == 1


def test_unexpected_payload_shape_is_a_source_error(monkeypatch):
    class Resp:
        def raise_for_status(self):
            pass

        def json(self):
            return {"not": "a list"}

    monkeypatch.setattr(requests.Session, "get", lambda *a, **k: Resp())
    with pytest.raises(importer.SourceError):
        importer.fetch_sightings()
