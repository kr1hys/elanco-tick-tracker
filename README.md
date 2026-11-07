# UK Tick Tracker

A minimum viable product (MVP) web app that maps UK tick sightings, shows trends for each city, teaches users to identify ticks and avoid bites, and lets the public report new sightings.

Built for the **Elanco Placement Program – Full Stack technical task**.

**Author:** Kieran

---

## Features

| Area | What's included |
|---|---|
| Interactive map | Map of UK sightings with one marker per city. Marker size and a yellow → orange → red colour gradient show how many sightings each city has, with a legend and tooltips. |
| Sighting information | Clicking a city opens a sidebar with totals, a trend chart (by year or last 24 months), a species breakdown and recent sightings. |
| Educational content | Identification guide for the 5 species in the data, plus tick-bite prevention tips for people and pets. |
| Report a sighting | Form with date, time, city and species dropdowns and notes. Shows per-field errors, non-blocking warnings and success messages, and the server validates submissions too. |
| Accessibility | Skip link, labelled inputs, error messages read out by screen readers, visible focus outlines, a keyboard-friendly city list as an alternative to the map, and markers whose meaning never relies on colour alone. |

Backend highlights:
- Imports data from the Elanco API, checking each record, skipping bad ones and removing duplicates.
- Keeps serving stored data if the external API is down.
- Supports filtering by date range, city and species, and provides counts per region and weekly/monthly trends.
- Returns consistent JSON error responses.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Python 3 + Flask** | Small and simple, which is all a handful of JSON endpoints needs |
| Database | **SQLite** (Python standard library) | No setup, a single file, and SQL makes filtering and counting easy |
| Frontend | **React 19 + Vite** | Reusable components for the map, sidebar and form, and a fast dev server |
| Map | **Leaflet + react-leaflet** with OpenStreetMap tiles | Free and needs no API key |
| Charts | **Recharts** | Simple charts that are easy to write in React |
| Tests | **pytest** | Covers validation, the importer and every endpoint |

There's no router, state library, CSS framework or ORM; the app doesn't need them at this size. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the reasoning.

**No API keys or secrets are needed.** The Elanco API is public and OpenStreetMap tiles are free.

## Running it locally

**Prerequisites:** Python 3.10+ and Node.js 20+ (developed with Python 3.13 and Node 24).

Run the backend and frontend in separate terminals.

### 1. Backend (runs on http://localhost:5001)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

On startup it creates `backend/ticks.db` and imports the Elanco data, logging something like
`Elanco import: {'received': 1000, 'stored': 1000, 'skipped_invalid': 0, 'duplicates': 0}`.

> It uses port 5001 because macOS uses port 5000 for AirPlay Receiver. To change it, run `PORT=xxxx python app.py` and update the proxy target in `frontend/vite.config.js`.

### 2. Frontend (runs on http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server forwards `/api/*` requests to the backend, so no extra setup is needed.

### Running the tests

```bash
cd backend
source .venv/bin/activate
python -m pytest
```

The tests use a temporary database and fake the Elanco API, so they run offline.

## API reference

All responses are JSON. Errors always have the form `{"error": "...", "details": {"field": "message"}}`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/meta` | Cities (with coordinates) and species (with Latin names) |
| GET | `/api/sightings` | List sightings, newest first. Filters: `start`, `end` (YYYY-MM-DD, end date included), `city`, `species`. Paging: `limit` (default 500, max 2000) and `offset` |
| GET | `/api/sightings/<id>` | One sighting, or 404 |
| POST | `/api/sightings` | Report a sighting. Body: `{"date": "2025-06-01T14:30", "location": "Leeds", "species": "Marsh tick", "notes": "optional"}` |
| GET | `/api/stats/regions` | Count and latest sighting per city (accepts the same filters) |
| GET | `/api/stats/trends` | Counts over time. `interval=week\|month`, plus the same filters |

Examples:

```bash
curl "http://localhost:5001/api/sightings?city=London&start=2024-01-01&end=2024-12-31"
```

```bash
curl "http://localhost:5001/api/stats/trends?city=Leeds&interval=month"
```

```bash
curl -X POST http://localhost:5001/api/sightings -H "Content-Type: application/json" -d '{"date":"2025-06-01","location":"Leeds","species":"Marsh tick"}'
```

## Project structure

```
backend/
  app.py            Flask app: routes and error handlers
  importer.py       Fetch, validate and de-duplicate the Elanco data
  db.py             SQLite schema and queries
  validation.py     Query filter and submission validation
  reference.py      City coordinates and the species list
  tests/            pytest suite
frontend/
  src/api.js        Fetch wrapper with consistent error handling
  src/App.jsx       Layout, tabs and shared state
  src/components/   MapView, Legend, Sidebar, TrendChart, ReportForm, SpeciesGuide, PreventionTips
  src/data/         Static educational content
docs/
  REQUIREMENTS.md   What the MVP covers and what's out of scope
  PLAN.md           Dependencies and build order
  ARCHITECTURE.md   Design decisions, data flow and future improvements
```

## Known limitations

- The source data only gives a city, so sightings are shown at city-centre coordinates rather than exact locations.
- User reports aren't moderated and there's no login.
- Species descriptions are general guidance, not veterinary or medical advice.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#what-i-would-improve-with-more-time) for the full list of future improvements, including a machine-learning tick identifier.
