# Plan and Tools

The tools we chose, why, and the order we built things in.

## Tools
| Part | Choice | Why |
|---|---|---|
| Backend | Python + Flask | Simple and familiar, and enough for a small set of endpoints |
| Database | SQLite (built into Python) | No setup and just one file; easy to search and count data |
| Frontend | React + Vite | Splits the page into reusable pieces; Vite runs it quickly while developing |
| Map | Leaflet + react-leaflet, with OpenStreetMap | Free, no key needed |

## Packages we install

### Backend (listed in `backend/requirements.txt`)
- `flask`: the web server
- `flask-cors`: lets the frontend talk to the backend while developing
- `requests`: downloads Elanco's data, with a time limit
- `pytest`: runs the automatic tests

Everything else (the database, dates, logging) is built into Python.

### Frontend (listed in `frontend/package.json`)
- `react`, `react-dom`: build the page
- `vite`, `@vitejs/plugin-react`: run and build the frontend
- `leaflet`, `react-leaflet`: the map
- `recharts`: the city activity chart

We left out anything the app doesn't need at this size, such as page routing, a styling framework, or extra data-management libraries.

## Build order (each step was its own commit)
1. ✅ Requirements and this plan
2. ✅ Backend basics: the server, the database, the city and species lists
3. ✅ Downloading Elanco's data: checking it, removing duplicates, coping when Elanco's service is down
4. ✅ Endpoints for reading sightings and the city/species lists
5. ✅ Endpoints for totals per city and over time
6. ✅ Saving new reports, the rules for them, error replies, and tests
7. ✅ Frontend basics and the map
8. ✅ The city side panel and chart
9. ✅ The report form and its messages
10. ✅ The species guide, prevention tips and accessibility
11. ✅ README and architecture document

**Added after the first version:** the yellow → red colour gradient, the "Not sure / unknown species" option, the map filters, the accessibility document, and these docs rewritten in plain English.
