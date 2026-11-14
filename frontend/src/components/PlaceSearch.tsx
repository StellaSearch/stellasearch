import { useEffect, useState } from 'react'
import { geocode } from '../api/geocode'
import type { Place } from '../types'

export function PlaceSearch({ onPick }: { onPick: (p: Place) => void }) {
  const [q, setQ] = useState('')
  const [opts, setOpts] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const short = q.trim().length < 2

  useEffect(() => {
    if (short) return
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      geocode(q, ctrl.signal)
        .then(r => { setOpts(r); setOpen(true) })
        .catch(e => { if (e.name !== 'AbortError') setOpts([]) })
    }, 300)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q, short])

  function pick(p: Place) {
    setQ(p.name)
    setOpen(false)
    onPick(p)
  }
  const shown = short ? [] : opts

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => shown.length && setOpen(true)}
        placeholder="where are you looking up from?"
      />
      {open && shown.length > 0 && (
        <ul style={{ position: 'absolute', margin: 0, padding: 0, listStyle: 'none', background: '#fff', color: '#000', zIndex: 10 }}>
          {opts.map(p => (
            <li key={`${p.lat},${p.lon}`}>
              <button type="button" onClick={() => pick(p)}>{p.name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
