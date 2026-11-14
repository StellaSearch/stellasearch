import { useState } from 'react'
import { useSky } from './hooks/useSky'
import Results from './components/Results'
import type { Place } from './types'

const today = new Date().toISOString().slice(0, 10)

export default function App() {
  // hardcoded for now; SearchBar will call setPlace later
  const [place] = useState<Place | null>({ lat: 40.3, lon: -74.6, name: 'Princeton' })
  const [date, setDate] = useState(today)
  const { data, isLoading, error } = useSky(place, date)

  return (
    <main>
      <h1>StellaSearch</h1>
        <div className="controls">
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>

      {isLoading && <p>loading...</p>}
      {error && <p>error: {String(error)}</p>}
      {data && <Results items={data} />}
    </main>
  )
}
