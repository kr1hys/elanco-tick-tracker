import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { colourAt, NONE_COLOUR, scaleFor } from './colourScale'

const UK_CENTRE = [54.3, -2.5]

function radiusFor(count, max) {
  return max ? 8 + 18 * Math.sqrt(count / max) : 8
}

export default function MapView({ regions, selectedCity, onSelect }) {
  const counts = regions.map((r) => r.count)
  const max = Math.max(0, ...counts)
  // Scale over cities that have sightings, so a zero doesn't flatten the gradient.
  const nonZero = counts.filter((c) => c > 0)
  const min = nonZero.length ? Math.min(...nonZero) : 0

  return (
    <MapContainer center={UK_CENTRE} zoom={6} className="map" scrollWheelZoom={false}
      aria-label="Map of UK tick sightings by city">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {regions.map((r) => {
        const selected = r.city === selectedCity
        return (
          <CircleMarker
            key={r.city}
            center={[r.lat, r.lng]}
            radius={radiusFor(r.count, max)}
            pathOptions={{
              color: selected ? '#1d3557' : '#ffffff',
              weight: selected ? 4 : 2,
              fillColor: r.count === 0 ? NONE_COLOUR : colourAt(scaleFor(r.count, min, max)),
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(r.city) }}
          >
            <Tooltip direction="top">
              <strong>{r.city}</strong>: {r.count} sightings
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
