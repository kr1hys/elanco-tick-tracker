# Glossary

Technical words used in this project, explained simply. Useful for reading the docs and for the interview.

## General

| Word | What it means |
|---|---|
| **MVP** (minimum viable product) | The simplest version of an app that does the essential job, so you can try it before building more. |
| **Frontend** | The part you see and click in the browser. Here it's built with React. |
| **Backend** | The part running on a server that stores data and answers the frontend's requests. Here it's Python + Flask. |
| **Full stack** | Building both the frontend and the backend. |
| **API** | A way for one program to ask another for data. Elanco's data service is an API, and so is our backend. |
| **Endpoint** | One specific address in an API, such as `/api/sightings`, that gives back one kind of data. |
| **GET / POST** | Two types of request. GET means "give me data"; POST means "here's some new data to save". |
| **JSON** | A simple text format for sending data between programs, e.g. `{"city": "Leeds", "count": 59}`. |
| **Status code** | A number in every reply saying how it went: 200 = OK, 201 = saved, 400 = you sent something wrong, 404 = not found, 429 = too many requests, 500 = the server broke. |
| **localhost** | Your own computer. `http://localhost:5173` is a website running only on your machine, which nobody else can reach. |
| **Port** | A numbered "door" on a computer that a program listens on. The backend uses 5001 and the frontend uses 5173. |

## Backend and data

| Word | What it means |
|---|---|
| **Flask** | A small Python tool for building a web server and its endpoints. |
| **Database / SQLite** | Where data is stored so it can be searched. SQLite is a simple database that lives in one file (`ticks.db`). |
| **SQL** | The language used to ask a database questions, like "count sightings per city". |
| **Index** (database) | Like a book's index: it lets the database find rows by date or city quickly, without reading everything. |
| **Importer** | Our code that downloads Elanco's data, checks it and saves it. |
| **Validation** | Checking that data is sensible before accepting it (e.g. "the date can't be in the future"). |
| **Duplicate / de-duplication** | The same sighting appearing twice / removing the extra copies. |
| **Upsert** | "Update or insert": if a row with this id exists, update it; if not, add it. This is how we stop duplicates. |
| **Timeout** | A time limit on a request, so the app doesn't wait forever if Elanco doesn't answer. |
| **Retry with backoff** | If a request fails, try again, waiting a bit longer each time. |
| **Rate limiting** | A limit on how many requests someone can make in a period. Elanco's service has one (the 429 error), and we'd add one to our report form in future. |
| **Pagination / paging** | Sending results in batches (e.g. 500 at a time) instead of everything at once. `limit` is the batch size and `offset` is where to start. |
| **Aggregate** | A total or summary worked out from many rows, like "95 sightings in Nottingham". |
| **Log** | Messages the server writes for developers, e.g. "imported 1,000 sightings". Users never see them. |
| **Environment (venv)** | A separate folder of Python packages just for this project, so it doesn't clash with other projects. |

## Frontend

| Word | What it means |
|---|---|
| **React** | A JavaScript library for building pages out of reusable pieces called **components** (the map, the form, the panel…). |
| **Component** | One reusable piece of the page, e.g. `ReportForm`. |
| **State** | Information the page remembers while you use it, like which city is selected. |
| **Vite** | A tool that runs the frontend while developing and packages it for release. |
| **Leaflet** | A JavaScript library for interactive maps. **OpenStreetMap** provides the free map images. |
| **Recharts** | A library for drawing charts in React. |
| **Proxy** | The frontend's dev server passes `/api` requests on to the backend, so the browser only talks to one address. |
| **CORS** | A browser safety rule about which websites can call an API. `flask-cors` allows our frontend to call our backend. |

## Accessibility

| Word | What it means |
|---|---|
| **Screen reader** | Software that reads a web page out loud, used by blind and partially sighted people. |
| **WCAG** | The standard accessibility guidelines for websites. "AA" is the level most organisations aim for. |
| **ARIA** | Extra labels in a page's code that tell screen readers what something is or does, e.g. "this button is pressed". |
| **Live region** (`aria-live`) | A part of the page that screen readers read out automatically when it changes, like the "Showing N sightings" line. |
| **Landmark** | A labelled section of the page (header, main, navigation…) that screen-reader users can jump to. |
| **Focus** | Which element the keyboard is currently on. The **focus outline** shows where it is. |
| **Skip link** | A hidden link at the very top that appears when you press Tab and jumps straight to the main content. |

## Testing and tools

| Word | What it means |
|---|---|
| **pytest** | A Python tool that runs automatic tests to check code still works. |
| **Mock / fake** | A pretend version of something, like a fake Elanco service in tests, so tests don't need the internet. |
| **Git / commit / repo** | Git tracks changes to the code. A **commit** is a saved snapshot with a message. A **repo** (repository) is the project folder with its full history, stored on GitHub. |
| **CI** (continuous integration) | Automatically running the tests every time code is pushed. |
| **Docker** | A way to package an app with everything it needs, so it runs the same anywhere. |

## Machine learning (future idea)

| Word | What it means |
|---|---|
| **Machine learning (ML)** | Teaching a computer to recognise patterns from examples instead of writing rules by hand. |
| **Image recognition model** | An ML program that looks at a photo and says what's in it. |
| **Pre-trained model / transfer learning** | Starting from a model that already recognises general images, then training it further on tick photos. It needs far fewer photos than starting from scratch. |
| **Labelled data** | Photos where an expert has written down the correct answer (the species), used to train the model. |
| **Confidence score** | How sure the model is about its answer, e.g. "82% sure this is a Marsh tick". |
