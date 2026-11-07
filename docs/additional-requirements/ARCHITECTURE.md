# Architecture

*Brief item: "a short document explaining your architecture decisions, how your system consumes and presents data, and things you would improve with more time."*

This explains how the app gets the tick data, cleans and stores it, and shows it to users, why it's built this way, and what I'd improve.

## The big picture

```
 ┌───────────────────────┐   downloaded once     ┌──────────────────────────────┐
 │  Elanco's data service│   when the server     │  Backend (Python + Flask)    │
 │  (1,000 sightings)    │ ─────────────────────▶│                              │
 └───────────────────────┘   starts (time limit, │  1. importer.py: check data, │
                             retries if it fails)│     remove duplicates        │
                                                 │  2. saved in SQLite database │
                                                 │  3. app.py: endpoints        │
                                                 └──────────────┬───────────────┘
                                                                │ JSON
                                                 ┌──────────────▼───────────────┐
                                                 │  Frontend (React)            │
                                                 │  Map · City panel · Form     │
                                                 │  Learn tab                   │
                                                 └──────────────────────────────┘
```

There are three steps:
1. When the backend starts, it downloads every sighting from Elanco, checks it and saves it in its own database.
2. The frontend asks the backend for what it needs, such as "sightings in London in 2024" or "totals per city".
3. When someone reports a sighting, the frontend sends it to the backend, which checks it and saves it next to Elanco's data.

## Getting the data in (`importer.py`)

Elanco's service sends all ~1,000 sightings in one go (about 140 KB). It has no option to send them in smaller pages.

| Problem | How we handle it |
|---|---|
| **Lots of data** | We download it **once at start-up** and save it in our database, instead of asking Elanco every time a user loads the page. Searching our own database is fast, and the database is set up (indexed) to look up dates and cities quickly. The list endpoint sends at most 2,000 sightings at a time. The map and charts ask the database for **totals**, so they never have to download every sighting. |
| **Duplicates** | If the same id appears twice, we keep one copy. When saving, a sighting whose id already exists is updated rather than added again, so downloading the data twice never creates copies. |
| **Incomplete or messy data** | Every sighting is checked: it needs an id, a real date, and a city and species we recognise. Small differences like "london" vs "London" are tidied up. The Latin name always comes from our own list, so a wrong one from the source can't sneak in. Anything broken is skipped and counted in the server's log. |
| **Elanco's service failing** | Each request has a 10-second time limit. If Elanco is busy or has an error, we try up to 3 more times, waiting a little longer each time. If it still fails, the app **doesn't crash**: it logs a warning and keeps using the data it already has. |

**No map coordinates:** Elanco only gives a city name, so `reference.py` stores the centre of each of the 14 cities. The same list fills the report form's city dropdown, so user reports always match a known city.

## Storing the data

There's one table, `sightings`. Each row records where it came from (`elanco` or `user`). User reports get a random id, so they can never clash with Elanco's ids.

**Why SQLite?** It's built into Python, needs no setup, and is just one file. It can still filter by date, city and species and add up totals per city, week or month. If the app grew, we could switch to a bigger database (PostgreSQL) and only one file (`db.py`) would need to change, because every database query is in there.

## How the backend answers requests (`app.py`)

- The endpoint names say what they return: `/sightings`, `/stats/regions` (totals per city), `/stats/trends` (totals over time) and `/meta` (the city and species lists). Only `POST /sightings` changes anything; the rest just read data.
- The same filters (`start`, `end`, `city`, `species`) work everywhere and are checked by the same code. The end date counts, so `end=2024-01-20` includes all of 20 January.
- Our replies use the same field names as Elanco's (for example `latinName`), so they're easy to follow.
- The app is built by a function (`create_app`), which lets the tests start a fresh copy with an empty test database.

### When things go wrong

| What happened | What the user gets |
|---|---|
| They sent something invalid | Error **400**, with a message for each field that's wrong |
| They asked for something that doesn't exist | Error **404**, as a readable message |
| Something unexpected broke | Error **500**, "Internal server error". The technical details only go into the server's log, never to the user |
| Elanco's service is down | Nothing visible: the app keeps working with the data it already has |

On the frontend, `api.js` turns every failure (including "can't reach the server at all") into a clear message. The form uses the server's per-field messages to show each error next to the right field.

## The frontend

- **Kept simple.** There's no page routing or extra state library. `App.jsx` remembers the few things the whole page needs: which tab is open, which city is selected, the filters and the city totals. After a new report is saved, the map and panel reload so the report appears straight away.
- **The map** draws a circle for each city.
  - **Size** and **colour** both run from the quietest city to the busiest, not from zero. With all 1,000 sightings, cities range from 57 to 95. Measured from zero, those all looked about the same size; measured from 57 to 95, the differences are easy to see. The trade-off is that sizes show how cities *compare*, not exact amounts, so the exact number is in each circle's tooltip and on the city buttons.
  - **Size:** the quietest city gets the smallest circle (still easy to click) and the busiest the largest. In between, the circle's *area* grows in step with the count, so big circles don't look bigger than they should.
  - **Colour:** a smooth yellow → orange → red scale, explained by a "Least → Most" key.
  - **Grey, smaller dots** mean no sightings match the current filters.
  - **Zoom** is by the +/− buttons, double-click or pinch, not the scroll wheel, so scrolling the page doesn't get stuck on the map.
- **The filters** (date range and species, including unknown species) use the backend's filters. The circles, city counts, the "Showing N sightings" line and the city panel all update together. If "From" is after "To", you get an error and the previous filters stay, so the map never goes blank by mistake.
- **The city panel** loads that city's sightings and uses them for the species breakdown and the recent list. Its chart (by year, or the last 24 months) gets its numbers from the trends endpoint, and periods with no sightings show as zero instead of disappearing.
- **"Not sure / unknown species":** most people can't tell tick species apart, so they can report a tick without identifying it. These reports are saved as `Unknown` and still count on the map and in charts.
- **The form** checks your answers as you go, using the same rules as the server, so you get instant feedback. The server always checks again. Warnings, such as "no time given" or "over a year ago", don't stop you submitting.

### Accessibility

Built in throughout: map circles that work with the keyboard, a city list as an alternative to the map, labelled form fields with errors read out by screen readers, and more. See **[ACCESSIBILITY.md](ACCESSIBILITY.md)**.

## Testing

There are 18 automatic backend tests (pytest). They check:
- Broken records, duplicates, differences in capitals and spacing, and wrong Latin names are all handled.
- Downloading the data twice doesn't create copies.
- If Elanco's service fails, the existing data is kept.
- Every endpoint, including filters, paging, the included end date, totals, errors and unknown species.

Elanco's service is faked in the tests, so they don't need the internet. The frontend was tested by hand in the browser at desktop and phone sizes.

## What I would improve with more time

New features (image upload, the machine-learning tick identifier, species photos, a searchable city picker and more) are listed in **[FUTURE_REQUIREMENTS.md](../FUTURE_REQUIREMENTS.md)**.

Technical improvements:
- **Refresh the data automatically** on a schedule, not just when the server starts.
- **A bigger database** (PostgreSQL) once there's much more data, with a proper way to update its structure safely (migrations).
- **Grouping nearby circles or a heat map**, if sightings ever get exact locations instead of city centres.
- **Spam protection** for new reports: limit how often someone can submit, add "I'm not a robot" checks, have a person approve reports, and add logins for trusted reporters such as vets.
- **Frontend tests** (Vitest) and an automatic accessibility checker (axe).
- **Putting it online:** package it with Docker, use a production-grade server (gunicorn), and run the tests automatically on every change (CI).
- **TypeScript** on the frontend to catch mistakes earlier, and automatically generated API documentation.
