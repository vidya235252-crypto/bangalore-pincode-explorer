# Bangalore Pincode Explorer

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-blue)

A full-stack web app that resolves any Bangalore/Bengaluru pincode to its
area, district, and state — instantly, with a REST API backing a clean,
dependency-free frontend.

**Live locally in under a minute:** clone → `pip install` → `uvicorn` →
open `index.html`. No database, no build step, no external API calls.

---

## Why this project

Most "pincode lookup" demos either hit a slow third-party API or ship a
tangled jQuery + PHP stack. This one is intentionally minimal and
production-shaped instead: a typed FastAPI service with real validation
and status codes, a static frontend that talks to it over a clean REST
contract, and a small, verified dataset that makes the whole thing run
completely offline.

## Features

- Lookup by 6-digit pincode, with all matching areas returned (some
  pincodes map to more than one locality, e.g. `560001`)
- Server-side validation with correct HTTP semantics (`200` / `400` /
  `404` / `500`)
- Distinct, clearly-designed UI states: initial, loading, success,
  invalid input, not found, and server error
- Popular-pincode shortcuts and a persisted "recent searches" list
  (`localStorage`)
- One-click copy of a pincode from any result card
- Fully responsive layout — desktop, tablet, and mobile
- Interactive API documentation via FastAPI's auto-generated Swagger UI

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript (no framework, no build step) |
| Backend    | Python 3, FastAPI, Uvicorn, Pydantic     |
| Data       | Local JSON dataset (no database required) |

## Architecture

```text
Browser
   │  fetch()
   ▼
Vanilla JavaScript          (frontend/)
   │  GET /api/pincodes/{pincode}
   ▼
FastAPI REST API             (backend/main.py, CORS enabled)
   │
   ▼
backend/data/pincodes.json   (verified Bangalore pincode dataset)
```

The frontend is a static site — it never talks to anything but the
FastAPI service. The backend loads the dataset once at startup and
serves every lookup from memory, so there's zero runtime dependency on
an external network.

## Project Structure

```text
bangalore-pincode-explorer/
├── frontend/
│   ├── index.html      # page structure & UI states
│   ├── style.css        # postmark-inspired responsive design
│   └── script.js         # fetch calls, validation, state handling
├── backend/
│   ├── main.py                # FastAPI app & routes
│   ├── requirements.txt
│   └── data/
│       └── pincodes.json      # verified Bangalore pincode dataset (32 entries)
├── .gitignore
└── README.md
```

## Getting Started

### 1. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API: `http://localhost:8000` · Interactive docs: `http://localhost:8000/docs`

### 2. Run the frontend

In a second terminal:

```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500` in your browser. The frontend calls the
API at `http://localhost:8000` — make sure the backend is running first.

## API Reference

### `GET /api/health`

```json
{ "status": "ok" }
```

### `GET /api/pincodes/{pincode}`

```text
GET /api/pincodes/560034
```

**`200 OK`**
```json
{
  "pincode": "560034",
  "areas": [
    { "name": "Koramangala", "district": "Bangalore Urban", "state": "Karnataka" }
  ]
}
```

**`400 Bad Request`** — pincode isn't exactly 6 numeric digits
```json
{ "detail": "Invalid pincode. Please provide exactly 6 numeric digits." }
```

**`404 Not Found`** — well-formed pincode with no dataset match
```json
{ "detail": "No Bangalore area found for pincode 560999." }
```

**`500 Internal Server Error`** — unexpected server-side failure
```json
{ "detail": "Unexpected server error: <message>" }
```

## Error Handling

- **Frontend** — input is restricted to digits as you type; Enter and the
  Search button both route through the same validated search flow.
  Network failures and every 4xx/5xx response map to a distinct, clearly
  worded UI state, so the user is never left guessing.
- **Backend** — the pincode path parameter is validated to be exactly 6
  numeric digits before any lookup runs. A valid-format pincode with no
  match returns `404`; any unexpected failure is caught and returned as
  `500` instead of crashing the process.

## Data Source

`backend/data/pincodes.json` contains 32 real Bangalore/Bengaluru
pincode records, cross-checked against public postal-code references
(India Post-derived directories and Wikipedia locality data), covering
areas including Indiranagar, Koramangala, Jayanagar, JP Nagar,
Whitefield, Electronic City, HSR Layout, Rajajinagar, Malleswaram,
Yelahanka, Hebbal, Marathahalli, Banashankari, Basavanagudi,
Shivajinagar, MG Road, Richmond Town, Frazer Town, Domlur, and
Bellandur. No pincode-to-area mapping in this dataset was invented.

## Future Improvements

- Expand coverage to all ~300+ Bangalore pincodes
- Add reverse search (area name → pincode)
- Add a map view using pincode-to-coordinates data
- Add automated tests (`pytest` for the API, a small JS test harness)
- Add basic rate limiting if the API were ever deployed publicly

## License

MIT
