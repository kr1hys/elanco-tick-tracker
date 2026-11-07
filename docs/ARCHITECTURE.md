# Architecture

This document explains how the system takes in, processes and presents tick sighting data, why it's built this way, and what I would change with more time.

## Overview

```
 ┌───────────────────────┐   once at startup    ┌──────────────────────────────┐
 │  Elanco Sightings API │ ───────────────────▶ │  Flask backend (Python)      │
 │  /data/tick-sightings │   GET + timeout,     │                              │
 └───────────────────────┘   retry on 429/5xx   │  importer.py  fetch / check  │
                                                │       │       / de-duplicate │
                                                │       ▼                      │
                                                │  SQLite (ticks.db)           │
                                                │       ▲                      │
                                                │  app.py  /api/* endpoints    │
                                                └──────────────┬───────────────┘
                                                               │ JSON
                                                ┌──────────────▼───────────────┐
                                                │  React frontend (Vite)       │
                                                │  Map · Sidebar · Report form │
                                                │  Learn tab                   │
                                                └──────────────────────────────┘
```

In development, the Vite dev server forwards `/api/*` to Flask, so the browser only ever talks to one address.

## Getting the data in (`importer.py`)

The Elanco API has no paging and returns the full list (about 1,000 records, 140 KB) in a single response. Each record contains `id, date, location, species, latinName`.

| Concern | How it's handled |
|---|---|
| **Large datasets** | The data is imported once into SQLite, not fetched on every user request, so the API is called once per startup and queries run locally against indexed columns (`date`, `location`). Rows are written in one batch. The list endpoint has `limit`/`offset` paging (max 2,000 per page), so a response can never be unbounded, and charts and map markers use counts calculated in the database rather than raw rows. |
| **Duplicates** | The importer removes repeated ids within one response, and the database write updates a row if its `id` already exists. Re-importing is therefore safe and never creates duplicates. |
| **Incomplete / inconsistent data** | Every record is checked: it needs an id, a date that parses, and a known city and species. City and species matching ignores case and extra spaces. The Latin name comes from our own reference table, so the source can't introduce mismatches. Bad records are skipped and counted in the import log, never stored. |
| **External API failures** | Every request has a 10-second timeout and up to 3 retries, waiting longer each time, on `429` and `5xx`. A non-JSON or non-list response counts as a failure. The import **never crashes the app**: on failure it logs a warning and the API keeps serving what's already in the database. |

**No coordinates:** the source data only has a city name, so `reference.py` maps each of the 14 cities to its city-centre latitude and longitude. This also gives the report form its fixed list of cities, which keeps user reports consistent with the imported data.

## Storage

There's a single `sightings` table, with a `source` column (`elanco` or `user`) so imported and user-submitted sightings can be told apart. User reports have random unique ids, so they can never clash with Elanco ids.

**Why SQLite?** It needs no setup and is a single file, and SQL handles filtering by date, city and species and grouping by city, week or month directly. Moving to PostgreSQL later would only affect `db.py`, because every query lives there.

## API design (`app.py`)

- The endpoint names describe what they return: `/sightings`, `/stats/regions`, `/stats/trends` and `/meta`. All are read-only except `POST /sightings`.
- The same filters (`start`, `end`, `city`, `species`) work on the list, region and trend endpoints, using one shared parser in `validation.py`. The `end` date is included, so `end=2024-01-20` covers the whole of that day.
- Results are sent in the same camelCase format as the Elanco API (`latinName`), so a frontend written for that API would work with ours.
- `create_app()` builds the app on demand, so tests can give it a temporary database and skip the import.

### Error handling

| Case | Response |
|---|---|
| Invalid query parameters or submission | `400` with `details` giving a message for each field |
| Unknown id or route | `404` as JSON |
| Unexpected exception | `500` "Internal server error". The details go to the server log; no internal error details are sent to the user |
| Elanco API down | App still starts and serves existing data, and a warning is logged |

The frontend's `api.js` turns every failure, including the server being unreachable, into an `ApiError` with a readable message and field details. The form uses those field details to show the server's errors on the matching fields.

## Frontend

- **No router or state library.** `App.jsx` holds the small amount of shared state (selected tab, selected city, city counts). A `refreshKey` counter increases after each submission so the map and sidebar reload.
- **The map** uses Leaflet circle markers. Circle size scales with the square root of the sighting count, so a city with 4 times the sightings gets a circle with 4 times the area rather than 4 times the width. Colour bands (High / Medium / Low, relative to the busiest city) back up the size, and both are explained in a legend.
- **The sidebar** loads the selected city's sightings once, then works out the species breakdown and recent list from them, and gets its trend data from `/stats/trends`. The chart fills in periods with no sightings as zero, so gaps aren't hidden.
- **The form** checks fields as you type, using the same rules as the server, so users get instant feedback. The server always re-checks. Errors are worked out fresh on every update, which avoids stale messages. Warnings, such as no time given or a date over a year old, don't block submission.

### Accessibility

- Skip link, landmarks (header, nav, main, aside, footer) and a clear heading order.
- Every input has a label. Fields with errors are marked invalid and linked to their error message. An error summary at the top of the form takes focus and links to each faulty field.
- Status updates are read out by screen readers.
- Switching tabs moves focus to the main content.
- Map markers can be hard to reach by keyboard, so a city button list does the same job. Marker meaning is shown by size, colour and text in the tooltip.
- Visible focus outlines, high-contrast colours, and animations switched off when the user asks for reduced motion.

## Testing

`backend/tests` (pytest, 16 tests) covers:
- importer clean-up (bad records, duplicates, case-insensitive matching, Latin name correction)
- re-importing without creating duplicates
- the Elanco API failing, with existing data kept
- every endpoint, including filters, paging, an included end date, aggregates, validation errors and JSON 404s

The Elanco API is faked in tests, so they run offline. The frontend was tested by hand in the browser at desktop and mobile widths.

## What I would improve with more time

**Features (from the brief, left out of the MVP):**
- **Image upload** with sighting reports: store files in object storage and check their type and size.
- **Map filter controls** for date range and species. The API already supports them, so this is frontend-only work.
- **Directions / Share** buttons, and a **seasonal chart** showing activity by month of the year for a location.
- **Photos in the species guide**: a real photo of the exact species on each card. Freely licensed photos only exist for 2 of the 5 species (*I. canisuga*, *I. frontalis*). Generic stand-in photos would mislead in an identification guide, so this needs properly licensed photos for all 5, with photographer credits.
- **ML tick identifier**: a user uploads a photo and an image-recognition model suggests the species, with a confidence score and that species' risk to pets and people.
  - The model would be adapted from an existing pre-trained one, and served from the Python backend (e.g. `POST /api/identify`).
  - The result would fill in the form's species field as a *suggestion*. Low-confidence results would say "unsure – ask your vet", and it would never be presented as a diagnosis.
  - The main challenge is a training set of expert-verified, labelled tick photos. Confirmed reports could add to it over time, with consent and moderation.

**Engineering:**
- **Scheduled re-sync** of the Elanco data, plus a manual re-sync admin endpoint, instead of importing only at startup.
- **PostgreSQL** (with PostGIS if exact coordinates become available) and database migrations, once data volumes grow.
- **Marker clustering or a heatmap** if sightings get real coordinates rather than city centres.
- **Abuse protection** on `POST /sightings`: rate limiting, a CAPTCHA, moderation before reports go public, and logins for trusted reporters (e.g. vets).
- **Frontend tests** (Vitest + React Testing Library) and an automated accessibility check (axe).
- **Deployment**: Docker Compose, a production server (gunicorn), the built frontend served as static files, and CI to run tests on every push.
- **TypeScript** on the frontend, and generated API docs (OpenAPI) for the backend.
