"""SQLite access. One table; plain SQL keeps filtering and aggregation simple."""
import sqlite3

SCHEMA = """
CREATE TABLE IF NOT EXISTS sightings (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,          -- ISO 8601, YYYY-MM-DDTHH:MM:SS
    location    TEXT NOT NULL,
    species     TEXT NOT NULL,
    latin_name  TEXT NOT NULL,
    notes       TEXT,
    source      TEXT NOT NULL           -- 'elanco' or 'user'
);
CREATE INDEX IF NOT EXISTS idx_sightings_date ON sightings(date);
CREATE INDEX IF NOT EXISTS idx_sightings_location ON sightings(location);
"""

COLUMNS = "id, date, location, species, latin_name, notes, source"


def connect(path):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(path):
    with connect(path) as conn:
        conn.executescript(SCHEMA)


def upsert_sightings(conn, rows):
    """Insert or update by id, so re-importing never creates duplicates."""
    conn.executemany(
        f"""INSERT INTO sightings ({COLUMNS})
            VALUES (:id, :date, :location, :species, :latin_name, :notes, :source)
            ON CONFLICT(id) DO UPDATE SET
                date = excluded.date, location = excluded.location,
                species = excluded.species, latin_name = excluded.latin_name""",
        rows,
    )
    conn.commit()


def insert_sighting(conn, row):
    conn.execute(
        f"INSERT INTO sightings ({COLUMNS}) "
        "VALUES (:id, :date, :location, :species, :latin_name, :notes, :source)",
        row,
    )
    conn.commit()


def build_filters(filters):
    """Turn validated filters into a WHERE clause + params (always parameterised)."""
    clauses, params = [], []
    if filters.get("start"):
        clauses.append("date >= ?")
        params.append(filters["start"])
    if filters.get("end"):
        clauses.append("date < ?")  # end is passed as the exclusive next day
        params.append(filters["end"])
    if filters.get("city"):
        clauses.append("location = ?")
        params.append(filters["city"])
    if filters.get("species"):
        clauses.append("species = ?")
        params.append(filters["species"])
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    return where, params


def list_sightings(conn, filters, limit, offset):
    where, params = build_filters(filters)
    total = conn.execute(f"SELECT COUNT(*) FROM sightings {where}", params).fetchone()[0]
    rows = conn.execute(
        f"SELECT {COLUMNS} FROM sightings {where} ORDER BY date DESC LIMIT ? OFFSET ?",
        [*params, limit, offset],
    ).fetchall()
    return total, [dict(r) for r in rows]


def get_sighting(conn, sighting_id):
    row = conn.execute(f"SELECT {COLUMNS} FROM sightings WHERE id = ?", (sighting_id,)).fetchone()
    return dict(row) if row else None


def counts_by_city(conn, filters):
    where, params = build_filters(filters)
    rows = conn.execute(
        f"SELECT location, COUNT(*) AS count, MAX(date) AS latest "
        f"FROM sightings {where} GROUP BY location",
        params,
    ).fetchall()
    return {r["location"]: dict(r) for r in rows}


PERIOD_FORMATS = {"month": "%Y-%m", "week": "%Y-W%W"}


def counts_over_time(conn, filters, interval):
    where, params = build_filters(filters)
    fmt = PERIOD_FORMATS[interval]  # validated by caller; never user text in SQL
    rows = conn.execute(
        f"SELECT strftime('{fmt}', date) AS period, COUNT(*) AS count "
        f"FROM sightings {where} GROUP BY period ORDER BY period",
        params,
    ).fetchall()
    return [dict(r) for r in rows]
