# Bangalore Pincode Explorer

## Overview

Bangalore Pincode Explorer is a full-stack web app that lets you enter a 6-digit
Bangalore/Bengaluru pincode and instantly see the area/post-office name, district,
and state associated with it. It's built with a lightweight vanilla JS frontend and
a small FastAPI backend backed by a local, verified dataset — no external APIs or
databases required.

## Features

- Search any 6-digit Bangalore pincode and see matching area(s)
- Handles pincodes that map to multiple areas (e.g. `560001`)
- Real-time input validation (digits only, 6-digit length)
- Distinct UI states: initial, loading, success, invalid input, not found, server error
- Popular pincode shortcuts and a "recent searches" list (persisted with `localStorage`)
- Copy-to-clipboard button on each result
- Fully responsive layout (desktop, tablet, mobile)
- REST API with interactive Swagger docs at `/docs`

## Tech Stack

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript (no frameworks, no build step)

**Backend**
- Python 3
- FastAPI
- Uvicorn
- Pydantic
- JSON (local dataset, no database)

## Architecture

```text
Browser
   ↓
Vanilla JavaScript (fetch API)
   ↓
FastAPI REST API  (CORS enabled)
   ↓
backend/data/pincodes.json  (local dataset)
```

The frontend is a static site that talks to the FastAPI backend over HTTP using
the Fetch API. The backend loads the pincode dataset once at startup and serves
lookups from memory — there is no external network dependency at runtime.

## Project Structure

```text
bangalore-pincode-explorer/
│
├── frontend/
│   ├── index.html      # page structure & UI states
│   ├── style.css        # postmark-inspired responsive design
│   └── script.js         # fetch calls, validation, state handling
│
├── backend/
│   ├── main.py                # FastAPI app & routes
│   ├── requirements.txt
│   └── data/
│       └── pincodes.json      # verified Bangalore pincode dataset (32 entries)
│
├── .gitignore
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

### Frontend

In a separate terminal:

```bash
cd frontend
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

> The frontend calls the API at `http://localhost:8000` (see `API_BASE` in
> `script.js`). Make sure the backend is running first.

## API Documentation

### `GET /api/health`

Health check.

**Response `200`**
```json
{ "status": "ok" }
```

### `GET /api/pincodes/{pincode}`

Look up a Bangalore pincode.

**Example request**
```text
GET /api/pincodes/560034
```

**Response `200`**
```json
{
  "pincode": "560034",
  "areas": [
    { "name": "Koramangala", "district": "Bangalore Urban", "state": "Karnataka" }
  ]
}
```

**Response `400`** — malformed pincode (not exactly 6 digits)
```json
{ "detail": "Invalid pincode. Please provide exactly 6 numeric digits." }
```

**Response `404`** — well-formed pincode with no matching record
```json
{ "detail": "No Bangalore area found for pincode 560999." }
```

**Response `500`** — unexpected server error
```json
{ "detail": "Unexpected server error: <message>" }
```

## Error Handling

- **Frontend**: input is restricted to digits as you type; the search button and
  Enter key are both wired to the same validated search flow. Network failures,
  4xx, and 5xx responses each map to a distinct, clearly worded UI state.
- **Backend**: the pincode path parameter is validated to be exactly 6 numeric
  digits before any lookup happens (`400` otherwise). A valid-format pincode with
  no dataset match returns `404`. Any unexpected failure while reading the dataset
  is caught and returned as `500` rather than crashing the process.

## Data Source

The dataset in `backend/data/pincodes.json` contains 32 real Bangalore/Bengaluru
pincode records, cross-checked against public postal-code references (including
India Post-derived directories and Wikipedia locality infoboxes) for areas such as
Indiranagar, Koramangala, Jayanagar, JP Nagar, Whitefield, Electronic City, HSR
Layout, Rajajinagar, Malleswaram, Yelahanka, Hebbal, Marathahalli, Banashankari,
Basavanagudi, Shivajinagar, MG Road, Richmond Town, Frazer Town, Domlur, and
Bellandur, among others. No pincode-to-area mapping was invented.

## Future Improvements

- Expand the dataset to cover all ~300+ Bangalore pincodes
- Add reverse search (area name → pincode)
- Add pincode-to-coordinates mapping and a map view
- Add basic automated tests (pytest for the API, a small JS test harness)
- Add a lightweight rate limiter if the API were ever made public

## License

MIT
