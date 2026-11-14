.PHONY: all install dev api web

all: install dev

install:
	cd backend && uv sync
	cd frontend && npm install

dv:
	$(MAKE) -j2 api web

api:
	cd backend && uv run uvicorn main:app --reload

web:
	cd frontend && npm run dev
