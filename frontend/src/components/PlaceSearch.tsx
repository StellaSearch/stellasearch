import { useEffect, useRef, useState } from 'react'
import { geocode } from '../api/geocode'
import type { Place } from '../types'

export function PlaceSearch({ onPick }: { onPick: (p: Place) => void }) {
  const [q, setQ] = useState('')
  const [opts, setOpts] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const short = q.trim().length < 2
  const skipNext = useRef(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (short) return
    if(skipNext.current){skipNext.current = false;return}
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      geocode(q, ctrl.signal)
        .then(r => { setOpts(r); setOpen(true) })
        .catch(e => { if (e.name !== 'AbortError') setOpts([]) })
    }, 300)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q, short])

  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false) 
    }

    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) } 
    document.addEventListener('pointerdown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('keydown', key)
    }

  }, [open])

  function pick(p: Place) {
    skipNext.current = true
    setQ(p.name)
    setOpen(false)
    onPick(p)
  }
  const shown = short ? [] : opts

  return (
    <div ref={root} style={{ position: 'relative' }}>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => shown.length && setOpen(true)}
        placeholder="enter location"
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
