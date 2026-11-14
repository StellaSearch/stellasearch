from pathlib import Path
from catalogs import vizier

DATA = Path(__file__).resolve().parents[1] / "data"

v = vizier()
v.columns = ["HIP", "RAICRS", "DEICRS", "Vmag"]
v.column_filters = {"Vmag": "<4.5"}
df = v.get_catalogs("I/239/hip_main")[0].to_pandas()
df.to_csv(DATA / "hip_vizier.csv", index=False)
