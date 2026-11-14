import type { Result } from '../types'

const dir = (az: number) =>
	['N','NE','E','SE','S','SW','W','NW'][Math.round(az / 45) % 8]

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return t
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function Results({ items }: { items: Result[] }) {
  if (items.length === 0) return <p>No constellations found...</p>
  const ranked = [...items].sort((a, b) => b.score - a.score)

  return (
    <ol>
      {ranked.map(r => (
        <li key={r.name}>
          <b>{r.name}</b>
          <br /> 
          score {r.score.toFixed(1)} | look {dir(r.azimuth)},{' '}
          {Math.round(r.peak_alt)}&deg; up | best at {fmtTime(r.best_time)}
        </li>
      ))}
    </ol>
  )
}
