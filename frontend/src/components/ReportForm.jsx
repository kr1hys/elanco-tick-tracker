import { useRef, useState } from 'react'
import { createSighting } from '../api'

const NOTES_MAX = 500
const EMPTY = { date: '', time: '', location: '', species: '', notes: '' }

const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Mirrors the backend rules so users get instant feedback; the backend still validates.
function validate(values, now = new Date()) {
  const errors = {}
  if (!values.date) errors.date = 'Please enter the date you saw the tick.'
  else {
    const when = new Date(`${values.date}T${values.time || '00:00'}`)
    if (Number.isNaN(when.getTime())) errors.date = 'Please enter a valid date.'
    else if (when > now) errors.date = 'The date cannot be in the future.'
  }
  if (!values.location) errors.location = 'Please choose a location.'
  if (!values.species) errors.species = 'Please choose a species.'
  if (values.notes.trim().length > NOTES_MAX) errors.notes = `Notes must be ${NOTES_MAX} characters or fewer.`
  return errors
}

function warnings(values, now = new Date()) {
  const out = []
  if (values.date) {
    const yearAgo = new Date(now)
    yearAgo.setFullYear(now.getFullYear() - 1)
    if (new Date(values.date) < yearAgo) out.push('This sighting is over a year old - please double-check the date.')
  }
  if (!values.time) out.push('No time given - we will record it as midnight on that day.')
  return out
}

function FieldError({ field, errors }) {
  return errors[field] ? <p id={`${field}-error`} className="field-error">{errors[field]}</p> : null
}

export default function ReportForm({ meta, onSubmitted }) {
  const [values, setValues] = useState(EMPTY)
  const [serverErrors, setServerErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState({ type: null, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const summaryRef = useRef(null)

  // Client errors are derived from current values every render (never stale);
  // they only show for fields the user has visited. Server errors show until that field changes.
  const clientErrors = validate(values)
  const errors = { ...serverErrors }
  Object.entries(clientErrors).forEach(([f, msg]) => { if (touched[f]) errors[f] = msg })

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setServerErrors(({ [field]: _removed, ...rest }) => rest)
  }
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ date: true, location: true, species: true, notes: true })
    if (Object.keys(clientErrors).length) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields.' })
      summaryRef.current?.focus()
      return
    }

    setSubmitting(true)
    setStatus({ type: null, message: '' })
    try {
      const saved = await createSighting({
        date: values.time ? `${values.date}T${values.time}` : values.date,
        location: values.location,
        species: values.species,
        notes: values.notes.trim(),
      })
      setStatus({ type: 'success', message: `Thank you! Your ${saved.species} sighting in ${saved.location} has been added to the map.`, city: saved.location })
      setValues(EMPTY)
      setTouched({})
      setServerErrors({})
      onSubmitted?.(saved)
    } catch (err) {
      setServerErrors(err.details || {})
      setStatus({ type: 'error', message: err.message === 'Invalid request' ? 'The server rejected some fields - please check them.' : err.message })
    } finally {
      setSubmitting(false)
      summaryRef.current?.focus()
    }
  }

  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: update(field),
    onBlur: blur(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })

  // Warnings don't block submission; only shown once a valid date is entered.
  const currentWarnings = values.date && !Object.keys(errors).length ? warnings(values) : []

  return (
    <section className="panel form-panel" aria-labelledby="report-heading">
      <h2 id="report-heading">Report a tick sighting</h2>
      <p className="muted">Spotted a tick? Help other pet owners by adding it to the map. Fields marked * are required.</p>

      <div ref={summaryRef} tabIndex={-1} aria-live="polite" className="status">
        {status.type === 'error' && (
          <div className="alert alert-error" role="alert">
            {status.message}
            {Object.keys(errors).length > 0 && (
              <ul>{Object.entries(errors).map(([f, msg]) => <li key={f}><a href={`#${f}`}>{msg}</a></li>)}</ul>
            )}
          </div>
        )}
        {status.type === 'success' && <div className="alert alert-success">{status.message}</div>}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="field">
            <label htmlFor="date">Date seen *</label>
            <input type="date" max={todayISO()} required {...fieldProps('date')} />
            <FieldError field="date" errors={errors} />
          </div>
          <div className="field">
            <label htmlFor="time">Time (optional)</label>
            <input type="time" {...fieldProps('time')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="location">Location *</label>
          <select required {...fieldProps('location')}>
            <option value="">Choose a city…</option>
            {meta?.cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <FieldError field="location" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="species">Species *</label>
          <select required {...fieldProps('species')}>
            <option value="">Choose a species…</option>
            {meta?.species.map((s) => <option key={s.name} value={s.name}>{s.name} ({s.latinName})</option>)}
          </select>
          <p className="hint">Not sure? See the <em>Learn about ticks</em> tab for an identification guide.</p>
          <FieldError field="species" errors={errors} />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea rows={4} maxLength={NOTES_MAX + 50} {...fieldProps('notes')}
            placeholder="e.g. Found on my dog after a walk in long grass" />
          <p className={`hint ${values.notes.length > NOTES_MAX ? 'over' : ''}`} aria-live="polite">
            {values.notes.length}/{NOTES_MAX} characters
          </p>
          <FieldError field="notes" errors={errors} />
        </div>

        {currentWarnings.length > 0 && (
          <div className="alert alert-warning">
            {currentWarnings.map((w) => <p key={w} className="warning-line">⚠ {w}</p>)}
          </div>
        )}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit sighting'}
        </button>
      </form>
    </section>
  )
}
