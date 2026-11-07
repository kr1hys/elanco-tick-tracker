import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Fill gaps so periods with no sightings show as 0 instead of disappearing.
function byYear(monthly) {
  if (!monthly.length) return []
  const totals = {}
  monthly.forEach(({ period, count }) => {
    const year = period.slice(0, 4)
    totals[year] = (totals[year] || 0) + count
  })
  const years = Object.keys(totals).map(Number)
  const out = []
  for (let y = Math.min(...years); y <= Math.max(...years); y++) {
    out.push({ period: String(y), count: totals[y] || 0 })
  }
  return out
}

function lastMonths(monthly, n = 24) {
  if (!monthly.length) return []
  const totals = Object.fromEntries(monthly.map((m) => [m.period, m.count]))
  const [endY, endM] = monthly[monthly.length - 1].period.split('-').map(Number)
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(endY, endM - 1 - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({ period: key, count: totals[key] || 0 })
  }
  return out
}

export default function TrendChart({ monthly, city }) {
  const [view, setView] = useState('year')
  const data = view === 'year' ? byYear(monthly) : lastMonths(monthly)
  const peak = data.reduce((best, d) => (d.count > (best?.count ?? -1) ? d : best), null)

  return (
    <div>
      <div className="toggle" role="group" aria-label="Trend period">
        <button aria-pressed={view === 'year'} onClick={() => setView('year')}>By year</button>
        <button aria-pressed={view === 'month'} onClick={() => setView('month')}>Last 24 months</button>
      </div>
      {data.length === 0 ? (
        <p className="muted">No sightings recorded yet.</p>
      ) : (
        <>
          <div className="chart" role="img"
            aria-label={`Bar chart of ${city} sightings ${view === 'year' ? 'per year' : 'per month'}. Peak: ${peak.period} with ${peak.count}.`}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Sightings" fill="#2a9d8f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="muted small">Peak: <strong>{peak.period}</strong> ({peak.count} sightings)</p>
        </>
      )}
    </div>
  )
}
