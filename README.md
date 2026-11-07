# UK Tick Tracker

A minimum viable product (MVP) web app that maps UK tick sightings, shows trends for each city, teaches users to identify ticks and avoid bites, and lets the public report new sightings.

Built for the **Elanco Placement Program – Full Stack technical task**.

**Author:** Kieran

---

## Features

| Area | What's included |
|---|---|
| Interactive map | Map of UK sightings with one marker per city. Marker size and a yellow → orange → red colour gradient show how many sightings each city has, with a legend and tooltips. Filter by date range and species; the map, city counts and sidebar all update. |
| Sighting information | Clicking a city opens a sidebar with totals, a trend chart (by year or last 24 months), a species breakdown and recent sightings. |
| Educational content | Identification guide for the 5 species in the data, plus tick-bite prevention tips for people and pets. |
| Report a sighting | Form with date, time, city and species dropdowns (including a "Not sure / unknown species" option for people who can't identify their tick) and notes. Shows per-field errors, non-blocking warnings and success messages, and the server validates submissions too. |
| Accessibility | Skip link, labelled inputs, error messages read out by screen readers, visible focus outlines, a keyboard-friendly city list as an alternative to the map, and markers whose meaning never relies on colour alone. See [ACCESSIBILITY.md](docs/additional-requirements/ACCESSIBILITY.md). |

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

There's no router, state library, CSS framework or ORM; the app doesn't need them at this size. See [docs/additional-requirements/ARCHITECTURE.md](docs/additional-requirements/ARCHITECTURE.md) for the reasoning.

**No API keys or secrets are needed.** The Elanco API is public and OpenStreetMap tiles are free.

## Running it locally

Requires Python 3.10+ and Node.js 20+. Run the backend and frontend in two separate terminals.

**Backend** (http://localhost:5001), which imports the Elanco data on startup:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend** (http://localhost:5173), which you then open in a browser:

```bash
cd frontend
npm install
npm run dev
```

**Tests:** run `python -m pytest` in `backend/` with the virtual environment active.

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
  src/components/   MapView, Legend, FilterBar, Sidebar, TrendChart, ReportForm, SpeciesGuide, PreventionTips
  src/data/         Static educational content
docs/
  REQUIREMENTS.md   What the MVP covers and what's out of scope
  PLAN.md           Dependencies and build order
  additional-requirements/   The brief's optional extras:
    README.md         What's covered and where
    ARCHITECTURE.md   Design decisions, data flow and future improvements
    ACCESSIBILITY.md  Accessibility features and known gaps
```

## Known limitations

- The source data only gives a city, so sightings are shown at city-centre coordinates rather than exact locations.
- User reports aren't moderated and there's no login.
- Species descriptions are general guidance, not veterinary or medical advice.

See [docs/additional-requirements/ARCHITECTURE.md](docs/additional-requirements/ARCHITECTURE.md#what-i-would-improve-with-more-time) for the full list of future improvements, including a machine-learning tick identifier.
