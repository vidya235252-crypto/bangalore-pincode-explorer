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
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Unable to load pincode dataset: {exc}") from exc


PINCODE_DATA = load_pincode_data()


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}


@app.get("/api/pincodes/{pincode}", response_model=PincodeResponse)
def get_pincode(pincode: str):
    if not pincode.isdigit() or len(pincode) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid pincode. Please provide exactly 6 numeric digits.",
        )

    try:
        areas = PINCODE_DATA.get(pincode)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Unexpected server error: {exc}"
        ) from exc

    if not areas:
        raise HTTPException(
            status_code=404,
            detail=f"No Bangalore area found for pincode {pincode}.",
        )

    return {"pincode": pincode, "areas": areas}
