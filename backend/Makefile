RAW = data/hip_vizier.csv
STARS = data/stars.parquet
.PHONY: all run clean distclean

all: $(STARS)

$(RAW): scripts/fetch_hipparcos_vizier.py
	uv run python $<

$(STARS): scripts/prep_stars.py $(RAW)
	uv run python $<

run: $(STARS)
	uv run uvicorn main:app --reload

clean:
	rm -f $(STARS)

distclean:
	rm -f $(RAW)
