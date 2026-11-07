import { useState } from 'react'
import { NO_FILTERS } from '../api'

// Date range + species filters for the map. Only valid combinations are passed up.
export default function FilterBar({ meta, filters, onChange, total }) {
  const [draft, setDraft] = useState(filters)
  const [error, setError] = useState('')

  const update = (field) => (e) => {
    const next = { ...draft, [field]: e.target.value }
    setDraft(next)
    if (next.start && next.end && next.start > next.end) {
      setError('The "From" date must be on or before the "To" date.')
      return
    }
    setError('')
    onChange(next)
  }

  const clear = () => {
    setDraft(NO_FILTERS)
    setError('')
    onChange(NO_FILTERS)
  }

  const active = Object.values(filters).some(Boolean)

  return (
    <form className="filters" role="search" aria-label="Filter sightings" onSubmit={(e) => e.preventDefault()}>
      <div className="field">
        <label htmlFor="filter-start">From</label>
        <input id="filter-start" type="date" value={draft.start} onChange={update('start')}
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'filter-error' : undefined} />
      </div>
      <div className="field">
        <label htmlFor="filter-end">To</label>
        <input id="filter-end" type="date" value={draft.end} onChange={update('end')}
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'filter-error' : undefined} />
      </div>
      <div className="field">
        <label htmlFor="filter-species">Species</label>
        <select id="filter-species" value={draft.species} onChange={update('species')}>
          <option value="">All species</option>
          {meta?.species.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
          {meta && <option value={meta.unknownSpecies}>Unknown species</option>}
        </select>
      </div>
      <button type="button" className="secondary" onClick={clear} disabled={!active && !error}>
        Clear filters
      </button>
      {error && <p id="filter-error" className="field-error filters-error" role="alert">{error}</p>}
      <p className="filters-summary" aria-live="polite">
        Showing <strong>{total.toLocaleString('en-GB')}</strong> sightings{active ? ' matching your filters' : ''}.
      </p>
    </form>
  )
}
