import { useEffect, useRef } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { colourAt, NONE_COLOUR, scaleFor } from './colourScale'

const UK_CENTRE = [54.3, -2.5]

const MIN_RADIUS = 13 // quietest city (still easy to click)
const MAX_RADIUS = 23 // busiest city
const NONE_RADIUS = 9 // no matching sightings

// Size runs from the quietest city to the busiest, like the colour scale, so
// differences stay visible even when every city has a similar count. Circle *area*
// grows in step with the count, so big circles don't look bigger than they should.
function radiusFor(count, min, max) {
  if (count === 0) return NONE_RADIUS
  const t = scaleFor(count, min, max)
  return Math.sqrt(MIN_RADIUS ** 2 + t * (MAX_RADIUS ** 2 - MIN_RADIUS ** 2))
}

// One city circle. Leaflet draws it as an SVG shape the browser can already Tab to,
// so we make it behave like a proper button: labelled, and opened with Enter or Space.
function CityMarker({ region, selected, fillColor, radius, onSelect }) {
  const markerRef = useRef(null)
  const label = `${region.city}, ${region.count} sightings`

  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.setAttribute('tabindex', '0')
    el.setAttribute('role', 'button')
    el.setAttribute('aria-label', label)
    el.setAttribute('aria-pressed', String(selected))

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault() // stop Space scrolling the page
        onSelect(region.city)
      }
    }
    el.addEventListener('keydown', onKeyDown)
    return () => el.removeEventListener('keydown', onKeyDown)
  }, [label, selected, onSelect, region.city])

  return (
    <CircleMarker
      ref={markerRef}
      center={[region.lat, region.lng]}
      radius={radius}
      pathOptions={{
        color: selected ? '#1d3557' : '#ffffff',
        weight: selected ? 4 : 2,
        fillColor,
        fillOpacity: 0.85,
      }}
      eventHandlers={{ click: () => onSelect(region.city) }}
    >
      <Tooltip direction="top">
        <strong>{region.city}</strong>: {region.count} sightings
      </Tooltip>
    </CircleMarker>
  )
}

export default function MapView({ regions, selectedCity, onSelect }) {
  const counts = regions.map((r) => r.count)
  const max = Math.max(0, ...counts)
  // Scale over cities that have sightings, so a zero doesn't flatten the gradient.
  const nonZero = counts.filter((c) => c > 0)
  const min = nonZero.length ? Math.min(...nonZero) : 0

  return (
    // react-leaflet doesn't pass aria attributes to the map element, so label a wrapper region.
    <div role="region" aria-label="Map of UK tick sightings by city. Press Tab to move between cities and Enter to open one.">
      <MapContainer center={UK_CENTRE} zoom={6} className="map" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map((r) => (
          <CityMarker
            key={r.city}
            region={r}
            selected={r.city === selectedCity}
            radius={radiusFor(r.count, min, max)}
            fillColor={r.count === 0 ? NONE_COLOUR : colourAt(scaleFor(r.count, min, max))}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>
    </div>
  )
}
