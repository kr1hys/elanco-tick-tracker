"""Flask API for the Elanco Tick Tracker."""
import logging
import os
import uuid

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

import db
import importer
from reference import CITIES, SPECIES
from validation import ValidationError, parse_filters, parse_int, validate_submission

DEFAULT_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ticks.db")


def create_app(config=None):
    app = Flask(__name__)
    app.config.update(
        DB_PATH=os.environ.get("TICK_DB_PATH", DEFAULT_DB),
        IMPORT_ON_STARTUP=True,
        ELANCO_URL=importer.ELANCO_URL,
    )
    app.config.update(config or {})
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_db(app.config["DB_PATH"])
    if app.config["IMPORT_ON_STARTUP"]:
        importer.run_import(app.config["DB_PATH"], app.config["ELANCO_URL"])

    def get_db():
        if "db" not in g:
            g.db = db.connect(app.config["DB_PATH"])
        return g.db

    @app.teardown_appcontext
    def close_db(_exc):
        conn = g.pop("db", None)
        if conn is not None:
            conn.close()

    # ---------- errors: always JSON, never a stack trace ----------
    def error(message, status, details=None):
        body = {"error": message}
        if details:
            body["details"] = details
        return jsonify(body), status

    @app.errorhandler(ValidationError)
    def handle_validation(exc):
        return error("Invalid request", 400, exc.errors)

    @app.errorhandler(HTTPException)
    def handle_http(exc):
        return error(exc.description, exc.code)

    @app.errorhandler(Exception)
    def handle_unexpected(exc):
        app.logger.exception("Unhandled error")
        return error("Internal server error", 500)

    # ---------- routes ----------
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.get("/api/meta")
    def meta():
        return jsonify({
            "cities": [{"name": n, "lat": lat, "lng": lng} for n, (lat, lng) in CITIES.items()],
            "species": [{"name": n, "latinName": latin} for n, latin in SPECIES.items()],
        })

    @app.get("/api/sightings")
    def sightings():
        filters = parse_filters(request.args)
        limit = parse_int(request.args, "limit", default=500, minimum=1, maximum=2000)
        offset = parse_int(request.args, "offset", default=0, minimum=0, maximum=10**9)
        total, rows = db.list_sightings(get_db(), filters, limit, offset)
        return jsonify({"total": total, "limit": limit, "offset": offset,
                        "results": [to_json(r) for r in rows]})

    @app.get("/api/sightings/<sighting_id>")
    def sighting(sighting_id):
        row = db.get_sighting(get_db(), sighting_id)
        if row is None:
            return error("Sighting not found", 404)
        return jsonify(to_json(row))

    @app.post("/api/sightings")
    def create_sighting():
        payload = request.get_json(silent=True)
        if payload is None:
            return error("Request body must be valid JSON", 400)
        row = validate_submission(payload)
        row.update(id=uuid.uuid4().hex, source="user")
        db.insert_sighting(get_db(), row)
        return jsonify(to_json(row)), 201

    @app.get("/api/stats/regions")
    def stats_regions():
        filters = parse_filters(request.args)
        counts = db.counts_by_city(get_db(), filters)
        regions = []
        for name, (lat, lng) in CITIES.items():
            c = counts.get(name, {})
            regions.append({"city": name, "lat": lat, "lng": lng,
                            "count": c.get("count", 0), "latest": c.get("latest")})
        regions.sort(key=lambda r: r["count"], reverse=True)
        return jsonify({"results": regions})

    @app.get("/api/stats/trends")
    def stats_trends():
        filters = parse_filters(request.args)
        interval = request.args.get("interval", "month")
        if interval not in db.PERIOD_FORMATS:
            raise ValidationError({"interval": "Must be 'week' or 'month'."})
        return jsonify({"interval": interval,
                        "results": db.counts_over_time(get_db(), filters, interval)})

    return app


def to_json(row):
    """DB row -> API shape (camelCase to match the Elanco API)."""
    return {"id": row["id"], "date": row["date"], "location": row["location"],
            "species": row["species"], "latinName": row["latin_name"],
            "notes": row.get("notes"), "source": row["source"]}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # Port 5001: macOS uses 5000 for AirPlay Receiver.
    create_app().run(port=int(os.environ.get("PORT", 5001)), debug=True)
