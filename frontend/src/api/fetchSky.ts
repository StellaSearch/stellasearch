import type { Place, Result } from '../types'

export async function fetchSky(p: Place, date: string): Promise<Result[]> {
  const r = await fetch(`/api/sky?lat=${p.lat}&lon=${p.lon}&date=${date}`)
  if (!r.ok) throw new Error(`sky ${r.status}`)
  return r.json()
}
