import { useEffect, useRef, useState } from 'react'
import { geocode } from '../api/geocode'
import type { Place } from '../types'

export function PlaceSearch({ onPick }: { onPick: (p: Place) => void }) {
  const [q, setQ] = useState('')
  const [opts, setOpts] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
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
    setOpts([])
    setActive(-1)
    onPick(p)
  }
  const shown = short ? [] : opts

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!shown.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive(i => (i + 1) % shown.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive(i => (i <= 0 ? shown.length - 1 : i - 1))
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault()
      pick(shown[active])
    }
  }

  return (
    <div ref={root} className="combo">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => shown.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="enter location"
        role="combobox"
        aria-expanded={open && shown.length > 0}
        aria-controls="place-list"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `place-opt-${active}` : undefined}
      />
      {open && shown.length > 0 && (
        <ul id="place-list" className="combo-list" role="listbox">
          {shown.map((p, i) => (
            <li
              key={`${p.lat},${p.lon}`}
              id={`place-opt-${i}`}
              role="option"
              aria-selected={i === active}
              style={{ '--i': i } as React.CSSProperties}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(p)}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
