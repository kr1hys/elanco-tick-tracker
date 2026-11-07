import { useEffect, useState } from 'react'
import { getSightings, getTrends } from '../api'
import TrendChart from './TrendChart'

const speciesLabel = (name) => (name === 'Unknown' ? 'Unknown species' : name)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Sidebar({ city, region, filters, refreshKey, onClose }) {
  const [sightings, setSightings] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setSightings(null)
    setError(null)
    Promise.all([getSightings({ ...filters, city, limit: 2000 }), getTrends({ ...filters, city, interval: 'month' })])
      .then(([s, t]) => {
        if (cancelled) return
        setSightings(s.results)
        setMonthly(t.results)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => { cancelled = true }
  }, [city, filters, refreshKey])

  const filtered = Object.values(filters || {}).some(Boolean)
  const speciesCounts = {}
  sightings?.forEach((s) => { speciesCounts[s.species] = (speciesCounts[s.species] || 0) + 1 })
  const speciesSorted = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1])

  return (
    <aside className="panel sidebar" aria-labelledby="sidebar-heading" aria-live="polite">
      <div className="sidebar-header">
        <h2 id="sidebar-heading">{city}</h2>
        <button className="close" onClick={onClose} aria-label={`Close ${city} details`}>×</button>
      </div>

      {region && (
        <dl className="stats">
          <div><dt>{filtered ? 'Matching sightings' : 'Total sightings'}</dt><dd>{region.count}</dd></div>
          <div><dt>Most recent</dt><dd>{region.latest ? formatDate(region.latest) : '—'}</dd></div>
        </dl>
      )}

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {!sightings && !error && <p className="muted">Loading…</p>}

      {filtered && <p className="muted small">Filters are applied to everything in this panel.</p>}

      {sightings && sightings.length === 0 && (
        <p className="muted">No sightings in {city} match your filters.</p>
      )}

      {sightings && sightings.length > 0 && (
        <>
          <h3>Activity over time</h3>
          <TrendChart monthly={monthly} city={city} />

          <h3>Species seen here</h3>
          <ul className="species-bars">
            {speciesSorted.map(([name, count]) => (
              <li key={name}>
                <span>{speciesLabel(name)}</span>
                <span className="bar" style={{ width: `${(count / speciesSorted[0][1]) * 100}%` }} aria-hidden="true" />
                <strong>{count}</strong>
              </li>
            ))}
          </ul>

          <h3>Recent sightings</h3>
          <ol className="recent">
            {sightings.slice(0, 5).map((s) => (
              <li key={s.id}>
                <strong>{speciesLabel(s.species)}</strong>{s.latinName && <> <em>({s.latinName})</em></>}
                <div className="muted small">
                  {formatDate(s.date)}{s.source === 'user' && ' · reported by a user'}
                </div>
                {s.notes && <div className="small">“{s.notes}”</div>}
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  )
}
