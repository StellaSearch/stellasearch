import { useMemo } from 'react'
import type { Result } from '../types'

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const dir = (az: number) =>
  COMPASS[Math.round((((az % 360) + 360) % 360) / 45) % 8]

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return t
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

export default function Results({ items }: { items: Result[] }) {
  const ranked = useMemo(() => [...items].sort((a, b) => b.score - a.score), [items])

  if (ranked.length === 0) return <p role="status">No constellations found.</p>

  return (
    <ol className="results">
      {ranked.map(r => (
        <li key={r.name} className="card">
          <h2 className="card-name">{r.name}</h2>
          <div className="stats">
            <div className="stat">
              <span className="stat-label">Score</span>
              <span className="stat-value score">{r.score.toFixed(1)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Look</span>
              <span className="stat-value">{dir(r.azimuth)}, {Math.round(r.peak_alt)}°</span>
            </div>
            <div className="stat">
              <span className="stat-label">Best time</span>
              <span className="stat-value">{fmtTime(r.best_time)}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
