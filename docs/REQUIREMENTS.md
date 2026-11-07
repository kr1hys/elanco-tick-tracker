# Requirements

What the UK Tick Tracker needed to do, and the choices we made. It's a deliberately small app: a Python backend that downloads, cleans and serves the tick data, and a React frontend that shows it on a map, explains it, and lets people report sightings.

## 1. The data we were given (Elanco's data service)

- Address: `https://dev-task.elancoapps.com/data`. We use `/tick-sightings` (all sightings) and `/health`.
- Each sighting has: an `id`, a `date` and time, a `location` (a UK city), a `species`, and its `latinName`.
- When we checked on 7 November 2026, it had **1,000 sightings** across **14 cities** and **5 species**, dated 2012–2024, with no duplicates or missing information.
- It can reply "too many requests" (error 429) or have a server error (500), so we handle both.
- **There are no map coordinates**, only a city name, so we keep our own list of where each city is.

## 2. Backend

### 2.1 Handling the data
- When the server starts, it downloads all sightings once and saves them in a **SQLite** database.
- Every sighting is checked: it must have an id, a real date, and a city and species we recognise. Broken ones are skipped (not saved), and the server logs how many.
- **Duplicates are removed:** if a sighting with the same id already exists, it's updated instead of added again, so downloading twice never creates copies.
- **If Elanco's service is down** or slow, the server still starts and uses whatever data it already saved, and logs a warning.
- Each sighting is marked as coming from Elanco (`elanco`) or from a user report (`user`).

### 2.2 Endpoints (the addresses the frontend calls, all starting `/api`)
| Request | Address | Purpose |
|---|---|---|
| GET | `/api/health` | Check the server is running |
| GET | `/api/meta` | Cities (with map positions) and species, for the map and the form's dropdowns |
| GET | `/api/sightings` | List sightings, narrowed by `start` and `end` dates, `city` and `species` |
| GET | `/api/sightings/<id>` | One sighting |
| POST | `/api/sightings` | Save a new sighting report |
| GET | `/api/stats/regions` | Number of sightings per city (same filters) |
| GET | `/api/stats/trends` | Number of sightings per week or month (same filters) |

### 2.3 Errors
- Every error reply looks the same: a short message, plus the problem with each field if there is one. For example: `{"error": "Invalid request", "details": {"date": "Date cannot be in the future."}}`.
- **400** = something you sent was wrong. **404** = that sighting or address doesn't exist. **500** = something unexpected broke on the server. The user only sees a simple message; the details go in the server's log.
- Every request to Elanco has a time limit and is retried a few times if it fails (see 2.1).

### 2.4 Rules for a new report (`POST /api/sightings`)
- **Date:** required, a real date (with an optional time), and not in the future.
- **Location:** required, one of the 14 cities (picked from a dropdown, and checked again by the server).
- **Species:** required, either one of the 5 species or **`Unknown`**, so people who can't identify their tick can still report it. Data imported from Elanco must still have a real species.
- **Notes:** optional, up to 500 characters.

## 3. Frontend

The brief asks for at least 2 features from each of 4 areas. We built:

| Area | What we built |
|---|---|
| Interactive map | A UK map with a circle for each city, whose size and colour (yellow → orange → red) show how many sightings it has; **plus** filters for date range and species (a third feature, added later) |
| Sighting information | A side panel when you click a city, with its details and recent sightings; a chart of that city's activity over time (by year or the last 24 months) |
| Educational content | A guide to the 5 tick species; tips for preventing tick bites |
| Report a sighting | A form (date, city, species with a "Not sure" option, and notes); clear error, warning and success messages, including errors sent back by the server |

### Accessibility
- Every form field has a label, and errors are read out by screen readers.
- Everything can be used with a keyboard, including the map: each circle can be reached with Tab and opened with Enter. The city list under the map does the same job.
- Good colour contrast, and the map never relies on colour alone: circle size and numbers show the same information.

The full details are in [additional-requirements/ACCESSIBILITY.md](additional-requirements/ACCESSIBILITY.md).

## 4. Secrets
- None needed: Elanco's service is public and the map is free.
- Files that could hold secrets later (`.env`) are set to never be uploaded to GitHub.

## 5. Testing
- Automatic tests (pytest) check that new reports are validated correctly, broken or duplicate data is handled, and every endpoint works. Elanco's service is faked in the tests, so they don't need the internet.

## 6. What we left out
Everything deliberately left out, and ideas for later, are in **[FUTURE_REQUIREMENTS.md](FUTURE_REQUIREMENTS.md)**.
