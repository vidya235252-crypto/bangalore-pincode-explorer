"""
Bangalore Pincode Explorer - FastAPI backend.

Serves a REST API for looking up Bangalore/Bengaluru pincodes and
returning the corresponding area / post office information.
"""

import json
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DATA_FILE = Path(__file__).parent / "data" / "pincodes.json"

app = FastAPI(
    title="Bangalore Pincode Explorer API",
    description="Look up Bangalore/Bengaluru areas by pincode.",
    version="1.0.0",
)

# Allow the local static frontend (any origin during development) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


class Area(BaseModel):
    name: str
    district: str
    state: str


class PincodeResponse(BaseModel):
    pincode: str
    areas: List[Area]


class HealthResponse(BaseModel):
    status: str


def load_pincode_data() -> dict:
    """Load the local pincode dataset from disk."""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Unable to load pincode dataset: {exc}") from exc


# Loaded once at startup; the dataset is small and static.
PINCODE_DATA = load_pincode_data()


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Simple liveness check for the API."""
    return {"status": "ok"}


@app.get("/api/pincodes/{pincode}", response_model=PincodeResponse)
def get_pincode(pincode: str):
    """
    Look up a Bangalore pincode and return its area/post office details.

    - **pincode**: a 6-digit numeric pincode, e.g. 560001
    """
    if not pincode.isdigit() or len(pincode) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid pincode. Please provide exactly 6 numeric digits.",
        )

    try:
        areas = PINCODE_DATA.get(pincode)
    except Exception as exc:  # pragma: no cover - unexpected server-side failure
        raise HTTPException(
            status_code=500, detail=f"Unexpected server error: {exc}"
        ) from exc

    if not areas:
        raise HTTPException(
            status_code=404,
            detail=f"No Bangalore area found for pincode {pincode}.",
        )

    return {"pincode": pincode, "areas": areas}
