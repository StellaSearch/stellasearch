import gzip
from pathlib import Path

import pandas as pd
from skyfield.api import load_constellation_map, position_of_radec
from skyfield.data import hipparcos

DATA = Path(__file__).resolve().parents[1] / "data"
SRC = DATA / "hip_vizier.csv"
OUT = DATA / "stars.parquet"

RA_COL = "RAICRS"
DEC_COL = "DEICRS"
MAG_COL = "Vmag"

RA_IS_DEGREES = True
MAG_LIMIT = 4.5

df = pd.read_csv(SRC)
df = df.dropna(subset=[RA_COL, DEC_COL, MAG_COL])
df = df[df[MAG_COL] <= MAG_LIMIT].copy()

df["ra_hours"] = df[RA_COL] / 15.0 if RA_IS_DEGREES else df[RA_COL]
df["dec_degrees"] = df[DEC_COL]
df["magnitude"] = df[MAG_COL]

const_at = load_constellation_map()
df["const"] = [
    const_at(position_of_radec(ra, dec))
    for ra, dec in zip(df["ra_hours"], df["dec_degrees"])
]

df.to_parquet(OUT)
print(f"{len(df)} stars -> {OUT}")
print(df.sort_values("magnitude")[["HIP", "magnitude", "const"]].head(8))
