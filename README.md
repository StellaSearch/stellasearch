# stella search

search for constellations based on

## layout

- backend/ api server
- frontent/ web ui

## project setup

requirements:
- [uv](https://docs.astral.sh/uv/)
- node 20+
- git

```
git clone https://github.com//stellasearch.git
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

### both
```
make dev
```
