import { useEffect, useRef, useState } from 'react'
import { getMeta, getRegions, getSightings, NO_FILTERS } from './api'
import FilterBar from './components/FilterBar'
import Legend from './components/Legend'
import MapView from './components/MapView'
import PreventionTips from './components/PreventionTips'
import ReportForm from './components/ReportForm'
import Sidebar from './components/Sidebar'
import SpeciesGuide from './components/SpeciesGuide'

const TABS = [
  { id: 'map', label: 'Sightings map' },
  { id: 'report', label: 'Report a sighting' },
  { id: 'learn', label: 'Learn about ticks' },
]

export default function App() {
  const [tab, setTab] = useState('map')
  const [meta, setMeta] = useState(null)
  const [regions, setRegions] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [speciesCounts, setSpeciesCounts] = useState({})
  const [filters, setFilters] = useState(NO_FILTERS)
  const mainRef = useRef(null)

  // Move focus to the content when switching tabs, so keyboard/screen-reader users land there.
  const changeTab = (id) => {
    setTab(id)
    requestAnimationFrame(() => mainRef.current?.focus())
  }

  useEffect(() => {
    getMeta().then(setMeta).catch((e) => setError(e.message))
  }, [refreshKey])

  // Map markers and city counts follow the active filters.
  useEffect(() => {
    getRegions(filters)
      .then((d) => { setRegions(d.results); setError(null) })
      .catch((e) => setError(e.message))
  }, [filters, refreshKey])

  // Per-species totals for the guide: limit=1 still returns the filtered total.
  useEffect(() => {
    if (!meta) return
    Promise.all(meta.species.map((sp) =>
      getSightings({ species: sp.name, limit: 1 }).then((d) => [sp.name, d.total])))
      .then((pairs) => setSpeciesCounts(Object.fromEntries(pairs)))
      .catch(() => {}) // the guide still works without counts
  }, [meta, refreshKey])

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <header className="header">
        <h1>UK Tick Tracker</h1>
        <nav aria-label="Main">
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
              aria-current={tab === t.id ? 'page' : undefined} onClick={() => changeTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main id="main" tabIndex={-1} ref={mainRef}>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        {tab === 'map' && (
          <section className="map-layout" aria-labelledby="map-heading">
            <div className="map-column">
              <h2 id="map-heading">Tick sightings across the UK</h2>
              <p className="muted">Click a city on the map (or pick one from the list) to see its details.</p>
              <FilterBar meta={meta} filters={filters} onChange={setFilters}
                total={regions.reduce((sum, r) => sum + r.count, 0)} />
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
                filters={filters} refreshKey={refreshKey} onClose={() => setSelectedCity(null)} />
            ) : (
              <aside className="panel sidebar muted">Select a city to see its sightings, trends and species.</aside>
            )}
          </section>
        )}
        {tab === 'report' && (
          <ReportForm meta={meta} onSubmitted={() => setRefreshKey((k) => k + 1)} />
        )}

        {tab === 'learn' && (
          <div className="learn">
            <SpeciesGuide countsBySpecies={speciesCounts} />
            <PreventionTips />
          </div>
        )}
      </main>

      <footer className="footer">
        Sighting data: Elanco tick sightings API. Map: © OpenStreetMap contributors.
        {meta && ` Tracking ${meta.species.length} species in ${meta.cities.length} cities.`}
      </footer>
    </>
  )
}
