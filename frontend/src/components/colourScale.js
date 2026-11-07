// Continuous yellow -> orange -> red scale. Shared by map markers and the legend.
export const STOPS = ['#f1c40f', '#e67e22', '#c0392b']

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// t in [0, 1]: 0 = quietest city (yellow), 0.5 = orange, 1 = busiest city (red).
export function colourAt(t) {
  const clamped = Math.min(1, Math.max(0, t))
  const segment = clamped < 0.5 ? 0 : 1
  const local = (clamped - segment * 0.5) / 0.5
  const [a, b] = [toRgb(STOPS[segment]), toRgb(STOPS[segment + 1])]
  const mixed = a.map((v, i) => Math.round(v + (b[i] - v) * local))
  return `rgb(${mixed.join(', ')})`
}

// Position of a count between the lowest and highest city counts.
export function scaleFor(count, min, max) {
  if (max > min) return (count - min) / (max - min)
  return max > 0 ? 0.5 : 0 // every city equal: use the middle of the scale
}

export const NONE_COLOUR = '#9aa5b1' // grey for cities with no matching sightings
