# UK Tick Tracker

A simple web app that shows where ticks have been spotted around the UK, how that changes over time, how to recognise and avoid ticks, and lets anyone report a new sighting.

Built for the **Elanco Placement Program – Full Stack technical task**.

**Author:** Kieran M

> New to any of the technical words below? See the [Glossary](docs/GLOSSARY.md).

---

## What it does

| Area | What you can do |
|---|---|
| **Map** | See every city's tick sightings on a UK map. Bigger, redder circles mean more sightings, explained by a "Least → Most" key. Filter by date range and species, and the whole page updates to match. |
| **City details** | Click a city (on the map or in the list under it) to open a side panel with its total sightings, a chart of activity over time, which species were seen, and the most recent sightings. |
| **Learn about ticks** | A guide to the 5 tick species in the data, plus tips for avoiding tick bites for you and your pets. |
| **Report a sighting** | A simple form: date, city, species and optional notes. If you don't know the species, pick "Not sure / unknown species". The form tells you clearly what's wrong, warns you about things worth double-checking, and confirms when your report is saved. |
| **Accessibility** | Works with a keyboard and screen reader, and nothing relies on colour alone. See [ACCESSIBILITY.md](docs/additional-requirements/ACCESSIBILITY.md). |

Behind the scenes, the backend:
- Downloads the sightings from Elanco's data service, throws away broken records and removes duplicates.
- Keeps working with the data it already has if Elanco's service is down.
- Lets the frontend search sightings by date, city and species, and get totals per city and per week or month.
- Always replies with a clear, readable error message when something goes wrong.

## What it's built with

| Part | Tool | Why |
|---|---|---|
| Backend (server) | **Python + Flask** | Simple, and enough for a small set of data endpoints |
| Database | **SQLite** | Built into Python, needs no setup, and is just one file |
| Frontend (what you see) | **React + Vite** | Splits the page into reusable pieces (map, panel, form), and Vite runs it quickly while developing |
| Map | **Leaflet** with OpenStreetMap | Free, with no account or key needed |
| Charts | **Recharts** | Easy charts for React |
| Tests | **pytest** | Automatically checks the backend works |

I kept it deliberately small, with no extra libraries the app doesn't need. The reasoning is in [ARCHITECTURE.md](docs/additional-requirements/ARCHITECTURE.md).

**No passwords, API keys or secrets are needed.** Elanco's data service is public and the map is free.

## Running it locally

You need Python 3.10+ and Node.js 20+. Use two separate terminal windows, one for each part.

**1. Backend** (runs at http://localhost:5001, and downloads the Elanco data when it starts):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

**2. Frontend** (runs at http://localhost:5173; open this address in your browser):

```bash
cd frontend
npm install
npm run dev
```

**Tests:** in the `backend` folder, with step 1's environment active, run `python -m pytest`.

## The backend's endpoints

These are the addresses the frontend asks for data. Every reply is JSON. If something is wrong, the reply says what, for example `{"error": "Invalid request", "details": {"location": "Please choose one of the listed cities."}}`.

| Request | Address | What it gives back |
|---|---|---|
| GET | `/api/health` | "ok" if the server is running |
| GET | `/api/meta` | The list of cities (with map positions) and species |
| GET | `/api/sightings` | Sightings, newest first. Can be narrowed with `start` and `end` dates (YYYY-MM-DD; the end date counts), `city` and `species`. Returns 500 at a time by default (`limit`, up to 2,000), and `offset` gets the next batch |
| GET | `/api/sightings/<id>` | One sighting |
| POST | `/api/sightings` | Saves a new report (date, location, species, optional notes) |
| GET | `/api/stats/regions` | How many sightings each city has, and its latest one (same filters as above) |
| GET | `/api/stats/trends` | How many sightings per week or per month (same filters) |

## Where things are

```
backend/
  app.py            Starts the server and defines the endpoints
  importer.py       Downloads, checks and de-duplicates Elanco's data
  db.py             Saves and reads data in the SQLite database
  validation.py     Checks searches and new reports are valid
  reference.py      The list of cities (with map positions) and species
  tests/            Automatic tests
frontend/src/
  App.jsx           The page layout and tabs
  api.js            Talks to the backend
  components/       Each piece of the page: map, key, filters, city panel, chart, form, guide, tips
  data/             The tick guide and prevention tips text
docs/
  REQUIREMENTS.md          What the app needed to do and what we chose
  PLAN.md                  The tools we used and the order we built things
  FUTURE_REQUIREMENTS.md   What we left out and ideas for later
  GLOSSARY.md              Technical words explained simply
  additional-requirements/ The brief's optional extras:
    README.md                What's covered and where
    ARCHITECTURE.md          How it's built and why
    ACCESSIBILITY.md         How it's made usable for everyone
```

## Known limitations

- Elanco's data only says which city a tick was seen in, so every sighting appears at the city centre rather than its exact spot.
- Anyone can submit a report, with no login or checking by a person.
- The tick guide is general information, not advice from a vet or doctor.

What we'd add next is in [FUTURE_REQUIREMENTS.md](docs/FUTURE_REQUIREMENTS.md), including image upload and a machine-learning tick identifier.
