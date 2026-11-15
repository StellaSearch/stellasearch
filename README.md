# stella search

search for constellations based on given location and date.

get a best time, viewing angle, and cardinal direction to face.

## layout

- backend/ api server
- frontent/ web ui

## project setup

requirements:
- [uv](https://docs.astral.sh/uv/)
- node 20+
- git

```
git clone https://github.com/StellaSearch/stellasearch.git
```

### local 

from project root:

backend (https://localhost:8000):

```
cd backend
uv sync
```

frontend (http://localhost:5173):

```
cd frontend
npm install
```

## run
from project root: 

### backend
```
cd backend
uv run uvicorn main:app --reload
```

### frontend
```
cd frontend
npm run dev
```

### full dev environment
```
make dev
```

## Data and references

- Star positions and magnitudes: Hipparcos catalogue, ESA (1997), The Hipparcos and Tycho Catalogues, ESA-SP-1200
- Astronomy engine: Skyfield by Brandon Rhodes (MIT license), [](https://rhodesmill.org/skyfield/)
- Sun and Moon positions: JPL planetary ephemeris, via Skyfield (DE421, Folkner et al. 2009).
- Constellation names and boundaries: IAU, as shipped with Skyfield.
- Atmospheric extinction: airmass formula from Kasten & Young (1989), Applied Optics 28(22), 4735.
- Moon and twilight sky brightness: simplified, hand-tuned model inspired by Krisciunas & Schaefer (1991), PASP 103, 1033. Constants are approximations and not representative of a faithful implementation.
- Light pollution: Bortle Dark-Sky Scale, J. Bortle (2001), Sky & Telescope, Feb 2001. Limiting magnitudes per class are approximate.

## Scoring Notes

`score` is relative to best constellation per place and night (top score = 10.0). Ranks that night's sky in that single location, not a global scale.

