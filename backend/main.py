from contextlib import asynccontextmanager
from datetime import date as Date
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from skyfield.api import Loader, Star

from scoring import score_night

DATA = Path(__file__).resolve().parent / "data"

@asynccontextmanager
async def lifespan(app: FastAPI):
    load = Loader(str(DATA))
    app.state.ts = load.timescale()
    app.state.eph = load("de421.bsp")
    df = pd.read_parquet(DATA / "stars.parquet")
    app.state.df = df
    app.state.stars = Star(
        ra_hours=df["ra_hours"].values,
        dec_degrees=df["dec_degrees"].values,
    )
    print(f"loaded {len(df)} stars")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/api/sky")
def sky(
    request: Request,
    lat: float = Query(ge=-90, le=90),
    lon: float = Query(ge=-180, le=180),
    date: Date = Query(),
    tz: str = Query(),
):
    try:
        ZoneInfo(tz)
    except ZoneInfoNotFoundError:
        raise HTTPException(422, f"unknown timezone: {tz}")
    s = request.app.state
    return score_night(s.ts, s.eph, s.stars, s.df, lat, lon, date, tz)

from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="static", html=True), name="static")
