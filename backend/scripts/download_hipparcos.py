import shutil
import time
import urllib.error
import urllib.request
from pathlib import Path

URL = "https://cdsarc.cds.unistra.fr/ftp/cats/I/239/hip_main.dat.gz"
DATA = Path(__file__).resolve().parents[1] / "data"
DEST = DATA / "hip_main.dat.gz"

def download(url: str, dest: Path, timeout: int = 60, tries: int = 3) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for attempt in range(1, tries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r, open(tmp, "wb") as out:
                shutil.copyfileobj(r, out)
            tmp.rename(dest)
            return
        except (urllib.error.URLError, TimeoutError) as e:
            print(f"attempt {attempt}/{tries} failed: {e}")
            time.sleep(3)
    raise SystemExit("download failed")


if __name__ == "__main__":
    if DEST.exists():
        print(f"already have {DEST}")
    else:
        download(URL, DEST)
        print(f"{DEST} ({DEST.stat().st_size / 1e6:.1f} MB)")
