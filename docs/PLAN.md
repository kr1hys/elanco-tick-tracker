# Plan & Dependencies

## Stack
| Layer | Choice | Why |
|---|---|---|
| Backend | Python 3 + Flask | Minimal, familiar, enough for a handful of JSON endpoints |
| Storage | SQLite (Python stdlib `sqlite3`) | Zero setup, single file, SQL makes filters and aggregates trivial |
| Frontend | React + Vite | Component structure for map/sidebar/form; fast dev server |
| Map | Leaflet + react-leaflet, OpenStreetMap tiles | Free, no API key |

## Dependencies

### Backend (`backend/requirements.txt`)
- `flask` – web framework
- `flask-cors` – allow the Vite dev server to call the API
- `requests` – call the Elanco API with timeouts
- `pytest` – a few tests for validation and endpoints *(dev only)*

Everything else (`sqlite3`, `datetime`, `logging`) is standard library.

### Frontend (`frontend/package.json`)
- `react`, `react-dom` – UI (from the Vite React template)
- `vite`, `@vitejs/plugin-react` – dev server / build
- `leaflet`, `react-leaflet` – map
- `recharts` – the per-city trend chart *(proposed; could be a plain list instead)*

No router, state library, CSS framework or ORM – not needed at this size.

## Project layout
```
backend/
  app.py          # Flask app + routes
  db.py           # SQLite setup + queries
  importer.py     # fetch, validate, dedupe Elanco data
  reference.py    # city coords, species list (+ latin names)
  validation.py   # submission validation
  tests/
frontend/
  src/components/ # Map, Sidebar, Trend, ReportForm, SpeciesGuide, PreventionTips
docs/
```

## Build order (≈ one commit per step)
1. Docs: requirements + plan ← *this commit*
2. Backend skeleton: Flask app, SQLite schema, reference data
3. Importer: fetch / validate / dedupe / fallback
4. Read endpoints: sightings list + filters, single sighting, meta
5. Stats endpoints: regions + trends
6. POST endpoint + validation + error handlers (+ tests)
7. Frontend skeleton (Vite + React) + map with markers
8. Sidebar + trend view
9. Report form with validation messages
10. Educational sections + accessibility pass
11. README, ARCHITECTURE.md, final tidy
