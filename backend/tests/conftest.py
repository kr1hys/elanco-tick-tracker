import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import db  # noqa: E402
from app import create_app  # noqa: E402

SAMPLE = [
    {"id": "a1", "date": "2024-01-10T10:00:00", "location": "London",
     "species": "Marsh tick", "latinName": "Ixodes apronophorus"},
    {"id": "a2", "date": "2024-01-20T10:00:00", "location": "London",
     "species": "Tree-hole tick", "latinName": "Ixodes arboricola"},
    {"id": "a3", "date": "2024-03-05T10:00:00", "location": "Leeds",
     "species": "Marsh tick", "latinName": "Ixodes apronophorus"},
]


@pytest.fixture
def db_path(tmp_path):
    path = str(tmp_path / "test.db")
    db.init_db(path)
    return path


@pytest.fixture
def client(db_path):
    with db.connect(db_path) as conn:
        db.upsert_sightings(conn, [
            {"id": r["id"], "date": r["date"], "location": r["location"],
             "species": r["species"], "latin_name": r["latinName"],
             "notes": None, "source": "elanco"} for r in SAMPLE
        ])
    app = create_app({"DB_PATH": db_path, "IMPORT_ON_STARTUP": False, "TESTING": True})
    return app.test_client()
