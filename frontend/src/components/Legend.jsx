export default function Legend() {
  const items = [
    { label: 'High', colour: '#c0392b', size: 20 },
    { label: 'Medium', colour: '#e67e22', size: 15 },
    { label: 'Low', colour: '#f1c40f', size: 11 },
  ]
  return (
    <div className="legend" aria-label="Map legend">
      <span className="legend-title">Activity (relative to busiest city)</span>
      {items.map((i) => (
        <span key={i.label} className="legend-item">
          <span className="legend-dot" aria-hidden="true"
            style={{ background: i.colour, width: i.size, height: i.size }} />
          {i.label}
        </span>
      ))}
      <span className="legend-note">Bigger circle = more sightings</span>
    </div>
  )
}
