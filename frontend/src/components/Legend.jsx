import { STOPS } from './colourScale'

export default function Legend() {
  return (
    <div className="legend" aria-label="Map legend: colour runs from yellow for the fewest sightings to red for the most; bigger circles mean more sightings">
      <span className="legend-title">Sightings per city</span>
      <span className="legend-scale" aria-hidden="true">
        <span>Least</span>
        <span className="legend-gradient" style={{ background: `linear-gradient(to right, ${STOPS.join(', ')})` }} />
        <span>Most</span>
      </span>
      <span className="legend-note">Bigger circle = more sightings</span>
    </div>
  )
}
