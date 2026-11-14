import type { Result } from '../types'

const dir = (az: number) =>
	['N','NE','E','SE','S','SW','W','NW'][Math.round(az / 45) % 8]


export default function Results({ items }: { items: Result[] }) {
  return (
    <ol>
      {items.map(r => (
        <li key={r.name}>
          <b>{r.name}</b><br></br> score {r.score.toFixed(1)} | look {dir(r.azimuth)},
          {' '}{r.peak_alt}&deg; up | best at {r.best_time}
        </li>
      ))}
    </ol>
  )
}
