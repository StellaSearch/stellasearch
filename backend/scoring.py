from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

import numpy as np
import pandas as pd
from skyfield.api import load_constellation_names, wgs84
from skyfield import almanac

NAMES = dict(load_constellation_names())
K_EXT = 0.2
MIN_ALT = 20.0
LIM_MAG = 4.5
STEP_MIN = 20
TOP_N = 15
BORTLE_LIM = {1: 7.8, 2: 7.3, 3: 6.8, 4: 6.3,
              5: 5.8, 6: 5.3, 7: 4.8, 8: 4.3, 9: 3.8}

def night_grid(day: date, zone: ZoneInfo):
    """utc datetime"""
    start = datetime.combine(day, time(18, 0), tzinfo=zone).astimezone(timezone.utc)
    n = 12 * 60 // STEP_MIN + 1
    return [start + timedelta(minutes=STEP_MIN * i) for i in range(n)]


def sky_limits(here, eph, t, site_lim):
    """keep sample indicies dark enough to use;
       lim: limit mag at each"""
    sun_alt = here.at(t).observe(eph["sun"]).apparent().altaz()[0].degrees
    moon_alt = here.at(t).observe(eph["moon"]).apparent().altaz()[0].degrees
    illum = almanac.fraction_illuminated(eph, "moon", t)

    twi = np.interp(sun_alt, [-18, -12, -6], [0.0, 1.5, 4.0])
    moon = np.where(moon_alt > 0, 2.0 * illum * np.sin(np.radians(moon_alt)), 0.0)

    lim = site_lim - twi - moon
    keep = np.where(sun_alt < -6)[0]

    return keep, lim[keep]


def sky_at(here, t, stars):
    alt, az, _ = here.at(t).observe(stars).apparent().altaz()
    return alt.degrees, az.degrees


def airmass(alt_deg):
    h = np.clip(alt_deg, 10.0, 90.0)
    return 1.0 / (np.sin(np.radians(h)) + 0.50572 * (h + 6.07995) ** -1.6464)


def score_samples(here, t, keep, stars, mag, lim, codes, n_const):
    """constellation x time score table, plus the alt/az per sample."""
    scores = np.zeros((n_const, keep.size))
    alts, azs = [], []
    for j, i in enumerate(keep):
        a, z = sky_at(here, t[int(i)], stars)
        alts.append(a)
        azs.append(z)
        vis = np.clip(lim[j] - mag - K_EXT * airmass(a), 0.0, None) * (a > 10.0)
        scores[:, j] = np.bincount(codes, weights=vis, minlength=n_const)
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


def score_night(ts, eph, stars, df, lat, lon, day, tz, bortle: int = 6):
    zone = ZoneInfo(tz)
    utc_times = night_grid(day, zone)
    t = ts.from_datetimes(utc_times)
    here = eph["earth"] + wgs84.latlon(lat, lon)

    keep, lim = sky_limits(here, eph, t, BORTLE_LIM[bortle])
    if keep.size == 0:
        return []

    mag = df["magnitude"].to_numpy()
    codes, labels = pd.factorize(df["const"])

    scores, alts, azs = score_samples(here, t, keep, stars, mag, lim, codes, len(labels))
    best_j = scores.argmax(axis=1)
    best_val = scores.sum(axis=1)
    top = best_val.max()
    if top <= 0:
        return []

    order = [c for c in np.argsort(-best_val)[:TOP_N] if best_val[c] > 0]
    return [
        build_row(c, best_j[c], top, best_val, labels, codes, mag,
                  alts, azs, utc_times[int(keep[best_j[c]])], zone)
        for c in order
    ]
