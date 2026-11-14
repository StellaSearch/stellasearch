import type { Place } from '../types'

type GeoHit = {
  name: string
  latitude: number
  longitude: number
  admin1?: string
  country?: string
  timezone?: string
}

type GeoResp = { results?: GeoHit[] }

export async function geocode(q: string, signal?: AbortSignal): Promise<Place[]> {
  const qs = new URLSearchParams({ name: q, count: '5', language: 'en'})
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${qs}`, { signal })
  if (!r.ok) throw new Error(`geocode ${r.status}`)
  const j: GeoResp =  await r.json()


  return (j.results ?? []).map(x => ({
    lat: x.latitude,
    lon: x.longitude,
    name: [x.name, x.admin1, x.country].filter(Boolean).join(', '),
    tz: x.timezone ?? 'UTC',
  }))
}

