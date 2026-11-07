import { STOPS } from './colourScale'

export default function Legend({ min, max }) {
  return (
    <div className="legend" aria-label={`Map legend: colour runs from yellow at ${min} sightings to red at ${max} sightings; bigger circles mean more sightings`}>
      <span className="legend-title">Sightings per city</span>
      <span className="legend-scale" aria-hidden="true">
        <span>{min}</span>
        <span className="legend-gradient" style={{ background: `linear-gradient(to right, ${STOPS.join(', ')})` }} />
        <span>{max}</span>
      </span>
      <span className="legend-note">Fewer (yellow, small) → more (red, large)</span>
    </div>
  )
}
