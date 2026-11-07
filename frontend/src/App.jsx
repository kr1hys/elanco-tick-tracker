import { useCallback, useEffect, useState } from 'react'
import { getMeta, getRegions } from './api'
import Legend from './components/Legend'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'

const TABS = [
  { id: 'map', label: 'Sightings map' },
]

export default function App() {
  const [tab, setTab] = useState('map')
  const [meta, setMeta] = useState(null)
  const [regions, setRegions] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadRegions = useCallback(() => {
    getRegions().then((d) => setRegions(d.results)).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    getMeta().then(setMeta).catch((e) => setError(e.message))
    loadRegions()
  }, [loadRegions, refreshKey])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <header className="header">
        <h1>UK Tick Tracker</h1>
        <nav aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
              aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        {tab === 'map' && (
          <section className="map-layout" aria-labelledby="map-heading">
            <div className="map-column">
              <h2 id="map-heading">Tick sightings across the UK</h2>
              <p className="muted">Click a city on the map (or pick one from the list) to see its details.</p>
              <MapView regions={regions} selectedCity={selectedCity} onSelect={setSelectedCity} />
              <Legend />
              {/* Keyboard/screen-reader friendly alternative to clicking map markers */}
              <h3>Cities</h3>
              <ul className="city-list">
                {regions.map((r) => (
                  <li key={r.city}>
                    <button className={r.city === selectedCity ? 'active' : ''}
                      aria-pressed={r.city === selectedCity} onClick={() => setSelectedCity(r.city)}>
                      {r.city} <span className="count">{r.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {selectedCity ? (
              <Sidebar city={selectedCity} region={regions.find((r) => r.city === selectedCity)}
                refreshKey={refreshKey} onClose={() => setSelectedCity(null)} />
            ) : (
              <aside className="panel sidebar muted">Select a city to see its sightings, trends and species.</aside>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        Sighting data: Elanco tick sightings API. Map: © OpenStreetMap contributors.
        {meta && ` Tracking ${meta.species.length} species in ${meta.cities.length} cities.`}
      </footer>
    </>
  )
}
