from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd
from skyfield.api import load_constellation_names, wgs84

NAMES = dict(load_constellation_names())
MIN_ALT = 20.0
STEP_MIN = 20
TOP_N = 15

def night_grid(day: date, zone: ZoneInfo):
    """utc datetime"""
    start = datetime.combine(day, time(18, 0), tzinfo=zone).astimezone(timezone.utc)
    n = 12 * 60 // STEP_MIN + 1
    return [start + timedelta(minutes=STEP_MIN * i) for i in range(n)]

def dark_indices(here, eph, t):
    """sample indices where sun is low, empty = no night"""
    sun_alt = here.at(t).observe(eph["sun"]).apparent().altaz()[0].degrees
    for limit in (-18, -12):
        idx = np.where(sun_alt < limit)[0]
        if idx.size:
            return idx
    return idx

def sky_at(here, t, stars):
    alt, az, _ = here.at(t).observe(stars).apparent().altaz()
    return alt.degrees, az.degrees


def score_samples(here, t, keep, stars, weight, codes, n_const):
    """constellation x time score table, plus the alt/az per sample."""
    scores = np.zeros((n_const, keep.size))
    alts, azs = [], []
    for j, i in enumerate(keep):
        a, z = sky_at(here, t[int(i)], stars)
        alts.append(a)
        azs.append(z)
        up = weight * np.clip((a - MIN_ALT) / 40.0, 0.0, 1.0)
        scores[:, j] = np.bincount(codes, weights=up, minlength=n_const)
    return scores, alts, azs

def build_row(c, j, scores_top, best_val, labels, codes, mag, alts, azs, utc_t, zone):
    a, z = alts[j], azs[j]
    members = np.where((codes == c) & (a > MIN_ALT))[0]
    lead = members[np.argmin(mag[members])]
    return {
        "name": NAMES.get(labels[c], labels[c]),
        "score": round(10 * best_val[c] / scores_top, 1),
        "peak_alt": int(round(a[lead])),
        "azimuth": int(round(z[lead])),
        "best_time": utc_t.astimezone(zone).strftime("%H:%M"),
    }


def score_night(ts, eph, stars, df, lat, lon, day, tz):
    zone = ZoneInfo(tz)
    utc_times = night_grid(day, zone)
    t = ts.from_datetimes(utc_times)
    here = eph["earth"] + wgs84.latlon(lat, lon)

    keep = dark_indices(here, eph, t)
    if keep.size == 0:
        return []

    mag = df["magnitude"].to_numpy()
    weight = 10 ** (-0.4 * mag)
    codes, labels = pd.factorize(df["const"])

    scores, alts, azs = score_samples(here, t, keep, stars, weight, codes, len(labels))
    best_j = scores.argmax(axis=1)
    best_val = scores.max(axis=1)
    top = best_val.max()
    if top <= 0:
        return []

    order = [c for c in np.argsort(-best_val)[:TOP_N] if best_val[c] > 0]
    return [
        build_row(c, best_j[c], top, best_val, labels, codes, mag,
                  alts, azs, utc_times[int(keep[best_j[c]])], zone)
        for c in order
    ]
