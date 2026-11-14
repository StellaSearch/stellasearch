import type { SkyQuery, Result } from '../types'

export async function fetchSky({ place, date }: SkyQuery): Promise<Result[]>{
  const qs = new URLSearchParams({
    lat: String(place.lat),
    lon: String(place.lon),
    date,
    tz: place.tz,
  })
  const res = await fetch(`/api/sky?${qs}`)
  if (!res.ok) throw new Error(`sky ${res.status}`)
  return res.json()
}
