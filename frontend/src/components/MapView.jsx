import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const UK_CENTRE = [54.3, -2.5]

// Activity levels: marker size AND colour AND text label, so meaning never relies on colour alone.
export function activityLevel(count, max) {
  const ratio = max ? count / max : 0
  if (ratio >= 0.8) return { label: 'High', colour: '#c0392b' }
  if (ratio >= 0.6) return { label: 'Medium', colour: '#e67e22' }
  return { label: 'Low', colour: '#f1c40f' }
}

function radiusFor(count, max) {
  return max ? 8 + 18 * Math.sqrt(count / max) : 8
}

export default function MapView({ regions, selectedCity, onSelect }) {
  const max = Math.max(0, ...regions.map((r) => r.count))

  return (
    <MapContainer center={UK_CENTRE} zoom={6} className="map" scrollWheelZoom
      aria-label="Map of UK tick sightings by city">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {regions.map((r) => {
        const level = activityLevel(r.count, max)
        const selected = r.city === selectedCity
        return (
          <CircleMarker
            key={r.city}
            center={[r.lat, r.lng]}
            radius={radiusFor(r.count, max)}
            pathOptions={{
              color: selected ? '#1d3557' : '#ffffff',
              weight: selected ? 4 : 2,
              fillColor: level.colour,
              fillOpacity: 0.85,
            }}
            eventHandlers={{ click: () => onSelect(r.city) }}
          >
            <Tooltip direction="top">
              <strong>{r.city}</strong>: {r.count} sightings ({level.label})
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
