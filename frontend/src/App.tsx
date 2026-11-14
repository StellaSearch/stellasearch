import { useState } from 'react'
import { useSky } from './hooks/useSky'
import Results from './components/Results'
import { PlaceSearch } from './components/PlaceSearch'
import type { Place } from './types'

const today = () => new Date().toLocaleString('en-CA')

export default function App() {
  const [place, setPlace] = useState<Place | null>(null)
  const [date, setDate] = useState(today)
  const { data, isLoading, error } = useSky(place, date)

  return (
    <main>
      <h1>StellaSearch</h1>
      <header className={place ? 'top' : 'centered'}>
        <div className="controls">
          <label className="field">
            <PlaceSearch onPick={setPlace} />
          </label>
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>
      </header>
      {!place && <p>Pick a location</p>}

      {isLoading && <p>loading...</p>}
      {error && <p>error: {String(error)}</p>}
      {place && !isLoading && !error && <Results items={data ?? []} />}
    </main>
  )
}
