from astroquery.vizier import Vizier
from astroquery.simbad import Simbad

VIZIER_SERVER = "vizier.cfa.harvard.edu"
SIMBAD_SERVER = "simbad.cfa.harvard.edu"

def vizier():
    return Vizier(vizier_server=VIZIER_SERVER, row_limit=-1)

def simbad():
    s = Simbad()
    s.server = SIMBAD_SERVER
    return s
