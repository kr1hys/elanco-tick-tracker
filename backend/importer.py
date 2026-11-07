"""Fetch sightings from the Elanco API, clean them and store them in SQLite.

Strategy:
- One request for the full list (the API has no paging; ~1,000 records / 140 KB).
- Retries with backoff on 429/5xx, and a timeout on every request.
- Each record is validated; bad ones are skipped and counted, never stored.
- Duplicates (same id) are collapsed, and the DB upsert keeps re-imports idempotent.
- Any failure is logged and the app keeps serving whatever is already stored.
"""
import logging

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

import db
from reference import SPECIES, normalise_city, normalise_species
from validation import parse_datetime

log = logging.getLogger(__name__)

ELANCO_URL = "https://dev-task.elancoapps.com/data/tick-sightings"
TIMEOUT_SECONDS = 10


class SourceError(Exception):
    """The external API could not give us usable data."""


def _session():
    retry = Retry(total=3, backoff_factor=1, status_forcelist=(429, 500, 502, 503, 504),
                  allowed_methods=("GET",))
    session = requests.Session()
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


def fetch_sightings(url=ELANCO_URL):
    try:
        response = _session().get(url, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise SourceError(f"Request to Elanco API failed: {exc}") from exc
    except ValueError as exc:
        raise SourceError("Elanco API returned invalid JSON") from exc
    if not isinstance(data, list):
        raise SourceError("Elanco API returned an unexpected format (expected a list)")
    return data


def clean_record(record):
    """Return a DB-ready dict, or None if the record is unusable."""
    if not isinstance(record, dict):
        return None
    sighting_id = record.get("id")
    when = parse_datetime(record.get("date"))
    city = normalise_city(record.get("location"))
    species = normalise_species(record.get("species"))
    if not (isinstance(sighting_id, str) and sighting_id.strip() and when and city and species):
        return None
    return {
        "id": sighting_id.strip(),
        "date": when.strftime("%Y-%m-%dT%H:%M:%S"),
        "location": city,
        "species": species,
        # Use our reference Latin name so inconsistent source values can't diverge.
        "latin_name": SPECIES[species],
        "notes": None,
        "source": "elanco",
    }


def clean_records(records):
    """Clean a batch. Returns (rows, stats)."""
    rows, seen, skipped, duplicates = [], set(), 0, 0
    for record in records:
        row = clean_record(record)
        if row is None:
            skipped += 1
        elif row["id"] in seen:
            duplicates += 1
        else:
            seen.add(row["id"])
            rows.append(row)
    return rows, {"received": len(records), "stored": len(rows),
                  "skipped_invalid": skipped, "duplicates": duplicates}


def run_import(db_path, url=ELANCO_URL):
    """Import into the DB. Never raises: on failure, existing data is kept."""
    try:
        records = fetch_sightings(url)
    except SourceError as exc:
        log.warning("%s - serving existing data only.", exc)
        return {"ok": False, "error": str(exc)}

    rows, stats = clean_records(records)
    with db.connect(db_path) as conn:
        db.upsert_sightings(conn, rows)
    log.info("Elanco import: %s", stats)
    return {"ok": True, **stats}
