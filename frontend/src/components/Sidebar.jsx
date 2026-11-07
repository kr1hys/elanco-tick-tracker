import { useEffect, useState } from 'react'
import { getSightings, getTrends } from '../api'
import TrendChart from './TrendChart'

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Sidebar({ city, region, refreshKey, onClose }) {
  const [sightings, setSightings] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setSightings(null)
    setError(null)
    Promise.all([getSightings({ city, limit: 2000 }), getTrends({ city, interval: 'month' })])
      .then(([s, t]) => {
        if (cancelled) return
        setSightings(s.results)
        setMonthly(t.results)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => { cancelled = true }
  }, [city, refreshKey])

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
          <div><dt>Total sightings</dt><dd>{region.count}</dd></div>
          <div><dt>Most recent</dt><dd>{region.latest ? formatDate(region.latest) : '—'}</dd></div>
        </dl>
      )}

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {!sightings && !error && <p className="muted">Loading…</p>}

      {sightings && (
        <>
          <h3>Activity over time</h3>
          <TrendChart monthly={monthly} city={city} />

          <h3>Species seen here</h3>
          <ul className="species-bars">
            {speciesSorted.map(([name, count]) => (
              <li key={name}>
                <span>{name}</span>
                <span className="bar" style={{ width: `${(count / speciesSorted[0][1]) * 100}%` }} aria-hidden="true" />
                <strong>{count}</strong>
              </li>
            ))}
          </ul>

          <h3>Recent sightings</h3>
          <ol className="recent">
            {sightings.slice(0, 5).map((s) => (
              <li key={s.id}>
                <strong>{s.species}</strong> <em>({s.latinName})</em>
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
