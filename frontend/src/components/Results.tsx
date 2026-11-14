import { useEffect, useMemo, useState } from 'react'
import type { Result } from '../types'

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const dir = (az: number) =>
  COMPASS[Math.round((((az % 360) + 360) % 360) / 45) % 8]

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return t
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useCountUp(target: number, delay: number, ms = 900) {
  const reduce = prefersReduced()
  const [v, setV] = useState(0)
  useEffect(() => {
    if (reduce) return
    let raf = 0
    let start = 0
    const t0 = setTimeout(() => {
      const step = (now: number) => {
        if (!start) start = now
        const p = Math.min((now - start) / ms, 1)
        setV(target * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(t0); cancelAnimationFrame(raf) }
  }, [target, delay, ms, reduce])
  return reduce ? target : v
}

function Compass({ az }: { az: number }) {
  return (
    <svg className="dial" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="28" className="dial-ring" />
      <text x="32" y="12" className="dial-n" textAnchor="middle">N</text>
      <g className="needle" style={{ '--az': `${az}deg` } as React.CSSProperties}>
        <polygon points="32,14 36,32 28,32" className="needle-head" />
        <polygon points="32,50 36,32 28,32" className="needle-tail" />
      </g>
      <circle cx="32" cy="32" r="2.5" className="needle-hub" />
    </svg>
  )
}

function AltArc({ alt }: { alt: number }) {
  const a = (Math.max(0, Math.min(90, alt)) * Math.PI) / 180
  const x = 8 + 48 * Math.cos(a)
  const y = 56 - 48 * Math.sin(a)
  return (
    <svg className="dial" viewBox="0 0 64 64" aria-hidden="true">
      <line x1="8" y1="56" x2="60" y2="56" className="dial-ring" />
      <path d="M56 56 A48 48 0 0 0 8 8" pathLength={1} className="arc" />
      <circle cx={x} cy={y} r="3.5" className="arc-dot" />
    </svg>
  )
}

function Card({ r, i }: { r: Result; i: number }) {
  const score = useCountUp(r.score, i * 60 + 200)
  return (
    <li
      className="card"
      style={{ '--i': i } as React.CSSProperties}
    >
      <h2 className="card-name">{r.name}</h2>
      <div className="stats">
        <div className="stat stat-score">
          <span className="stat-label">Score</span>
          <span className="stat-value score">{score.toFixed(1)}</span>
          <span className="bar">
            <i style={{ '--pct': Math.max(0, Math.min(10, r.score)) * 10 } as React.CSSProperties} />
          </span>
        </div>
        <div className="stat stat-look">
          <span className="stat-label">Look</span>
          <span className="look-row">
            <Compass az={r.azimuth} />
            <AltArc alt={r.peak_alt} />
            <span className="stat-value">{dir(r.azimuth)}, {Math.round(r.peak_alt)}{'°'}</span>
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Best time</span>
          <span className="stat-value">{fmtTime(r.best_time)}</span>
        </div>
      </div>
    </li>
  )
}

export function ResultsSkeleton() {
  return (
    <ol className="results" role="status" aria-busy="true" aria-label="Loading constellations">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="card skeleton" style={{ '--i': i } as React.CSSProperties}>
          <span className="sk sk-title" />
          <span className="sk sk-row" />
        </li>
      ))}
    </ol>
  )
}

export default function Results({ items }: { items: Result[] }) {
  const ranked = useMemo(() => [...items].sort((a, b) => b.score - a.score), [items])

  if (ranked.length === 0) return <p role="status">No constellations found.</p>

  return (
    <ol className="results">
      {}
      {ranked.map((r, i) => (
        <Card key={r.name} r={r} i={i} />
      ))}
      {}
    </ol>
  )
}
