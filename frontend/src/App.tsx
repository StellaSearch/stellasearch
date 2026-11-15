import { useState } from 'react'
import { useSky } from './hooks/useSky'
import Results, { ResultsSkeleton } from './components/Results'
import { PlaceSearch } from './components/PlaceSearch'
import { Starfield } from './components/Starfield'
import type { Place } from './types'

const today = () => new Date().toLocaleDateString('en-CA')

export default function App() {
  const [place, setPlace] = useState<Place | null>(null)
  const [date, setDate] = useState(today)
  const { data, isLoading, error } = useSky(place, date)

  const pickPlace = (p: Place) => {
      setPlace(p)
  }

  return (
    <>
      <Starfield />
      <main>
        <header className={place ? 'top' : 'centered'}>
          <div className="brand">
            <span className="brand-icon" aria-hidden />
            <h1>StellaSearch</h1>
          </div>
          <div className="controls">
            <label className="field">
              <span className="field-label">Location</span>
              <PlaceSearch onPick={pickPlace} />
            </label>
            <label className="field">
              <span className="field-label">Date</span>
              {}
              <input 
              type="date" 
              value={date} 
              onChange={e => e.target.value && setDate(e.target.value)} />
            </label>
          </div>
        </header>
        {}

        {place && isLoading && <ResultsSkeleton />}
        {error && <p>error: {String(error)}</p>}
        {place && !isLoading && !error && <Results items={data ?? []} />}
      </main>
    </>
  )
}
