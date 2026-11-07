# Requirements – Elanco Tick Tracker (MVP)

A deliberately small full-stack app: a Python (Flask) API that imports, cleans and serves
UK tick sighting data, and a React front end that maps it, explains it, and lets users report sightings.

## 1. Source data (Elanco API)

- Base URL: `https://dev-task.elancoapps.com/data`
- Endpoints used: `GET /tick-sightings` (full list), `GET /health`
- Record shape: `{ id, date (ISO 8601, no timezone), location (UK city), species, latinName }`
- Observed on 2026-11-07: 1,000 records, 14 cities, 5 species, dates 2012–2024,
  no duplicates or missing fields. API can return `429` (rate limited) and `500`.
- **No coordinates** are provided – the backend maps city → lat/lng with a fixed lookup table.

## 2. Backend requirements

### 2.1 Data handling
- On startup, fetch `/tick-sightings` once and store in **SQLite**.
- Validate each record: all required fields present, date parses, city in lookup table.
  Invalid records are skipped and counted in a log message (not stored).
- Deduplicate by `id` (upsert – re-running the import never creates duplicates).
- If the Elanco API is unreachable / errors / rate-limits, start anyway using whatever is
  already in the database, and log a warning.
- Imported records are marked `source = "elanco"`, user reports `source = "user"`.

### 2.2 API endpoints (all JSON, prefixed `/api`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/meta` | Cities (with lat/lng) and species list, for the map and form dropdowns |
| GET | `/api/sightings` | List sightings; filters: `start`, `end` (dates), `city`, `species` |
| GET | `/api/sightings/<id>` | Single sighting |
| POST | `/api/sightings` | Submit a new sighting report |
| GET | `/api/stats/regions` | Sighting count per city (accepts same filters) |
| GET | `/api/stats/trends` | Counts over time; `interval=week\|month`, optional `city`, `species` |

### 2.3 Error handling
- Consistent error body: `{ "error": "<message>", "details": {...optional field errors} }`.
- `400` for bad query params or invalid submissions (with per-field messages), `404` for
  unknown id/route, `500` for unexpected errors (no stack traces leaked).
- External API failures handled as in 2.1 (timeouts set on every request).

### 2.4 Submission validation (`POST /api/sightings`)
- `date` – required, valid ISO date/time, not in the future.
- `location` – required, chosen from a dropdown of the 14 known cities (validated server-side too).
- `species` – required, one of the known species (latin name derived server-side) **or `Unknown`**, so people who can't identify a tick can still report it. The Elanco import still requires a real species.
- `notes` – optional, max 500 characters.

## 3. Frontend requirements (React + Vite)

Brief requires ≥2 items per area; selected:

| Area | Features |
|---|---|
| Interactive map | UK map (Leaflet + OpenStreetMap) with one marker per city; marker size and yellow → orange → red gradient reflect sighting count |
| Sighting information | Sidebar panel on marker click (city details + recent sightings); small monthly trend chart (Recharts) for that city |
| Educational content | Species identification guide (the 5 species in the data); tick-bite prevention tips |
| Report a sighting | Form (date, city dropdown, species dropdown with a "Not sure / unknown species" option, notes); client-side validation with clear error / warning / success messages, plus server errors shown |

### Accessibility (basics)
- All form inputs have labels; errors announced via `aria-live`.
- Everything reachable by keyboard; visible focus styles.
- Sufficient colour contrast; marker meaning not conveyed by colour alone (size + text).

## 4. Secrets
- No API keys or credentials are needed: the Elanco API is public (no auth) and OpenStreetMap tiles need no key.
- `.env` is git-ignored in case any config is added later; nothing secret is committed.

## 5. Testing
- `pytest` tests for submission validation, importer dedupe/invalid-record handling, and the main endpoints (Elanco API mocked).

## 6. Out of scope (documented as future improvements)
- Image upload with reports, especially for sightings reported as **unknown species**: the photo would let a professional (e.g. a vet or parasitologist reviewing reports) or the ML identifier below work out the species, after which the report is updated
- Map filter controls (date range / species) in the UI – the API supports them already
- Directions / Share buttons, seasonal chart
- Authentication, moderation of user reports, deployment/hosting
- Precise geolocation of sightings (data is city-level only)
- **Photos in the species guide**: a real, species-accurate photo on each tick profile card.
  Freely licensed photos (Wikimedia Commons) exist for only 2 of the 5 species (*Ixodes canisuga*,
  *Ixodes frontalis*); generic stand-in photos were rejected as misleading for an identification guide.
  Would need properly licensed photos for all 5 (e.g. from Elanco or a parasitology partner),
  shown with photographer credits as the licence requires.
- **ML tick identifier**: users upload a photo of a tick and a trained image-classification
  model suggests the likely species, with a confidence score and that species' risk to pets/people
  (from the species guide). Would build on image upload above. Rough approach:
  - Train/fine-tune a pre-trained image model (e.g. a small CNN/vision transformer via transfer learning)
    on labelled tick photos; the main challenge is a good labelled dataset, ideally verified by experts/vets.
  - Serve it from the Python backend (e.g. `POST /api/identify`) so it fits the existing stack.
  - Show results as a *suggestion* with confidence, pre-filling the report form's species field;
    low-confidence results say "unsure - ask your vet". Never presented as a diagnosis.
  - Confirmed reports could become new training data over time (with consent and moderation).

## 7. Deliverables
- Public GitHub repo with README (project, technical choices, run instructions)
- `docs/ARCHITECTURE.md` – decisions, data flow, future improvements
- Walkthrough video (≤10 min) – recorded by Kieran
- **Deadline: 2026-11-08, 9am**
