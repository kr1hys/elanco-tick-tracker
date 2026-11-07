// Small fetch wrapper: every call returns parsed JSON or throws an ApiError
// carrying the backend's message and per-field details.

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.status = status
    this.details = details || {}
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0)
  }

  let body = null
  try {
    body = await response.json()
  } catch {
    // non-JSON response; handled below
  }

  if (!response.ok) {
    throw new ApiError(body?.error || `Request failed (${response.status})`, response.status, body?.details)
  }
  return body
}

export const NO_FILTERS = { start: '', end: '', species: '' }

function query(params) {
  const clean = Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  return clean.length ? `?${new URLSearchParams(clean)}` : ''
}

export const getMeta = () => request('/meta')
export const getRegions = (filters = {}) => request(`/stats/regions${query(filters)}`)
export const getTrends = (params = {}) => request(`/stats/trends${query(params)}`)
export const getSightings = (params = {}) => request(`/sightings${query(params)}`)
export const createSighting = (data) =>
  request('/sightings', { method: 'POST', body: JSON.stringify(data) })
