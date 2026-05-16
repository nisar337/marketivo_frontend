const KEY = 'marketivo_customer_location'

/**
 * @typedef {{ label: string, lat: number, lng: number }} ShoppingLocation
 */

/**
 * @returns {ShoppingLocation | null}
 */
export function getStoredShoppingLocation() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    const lat = typeof p.lat === 'number' ? p.lat : parseFloat(p.lat)
    const lng = typeof p.lng === 'number' ? p.lng : parseFloat(p.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return {
      label: typeof p.label === 'string' ? p.label : '',
      lat,
      lng,
    }
  } catch {
    return null
  }
}

/**
 * @param {ShoppingLocation | null | undefined} loc
 */
export function setStoredShoppingLocation(loc) {
  if (!loc || loc.lat == null || loc.lng == null || !Number.isFinite(loc.lat) || !Number.isFinite(loc.lng)) {
    localStorage.removeItem(KEY)
    return
  }
  localStorage.setItem(
    KEY,
    JSON.stringify({
      label: String(loc.label ?? '').slice(0, 500),
      lat: loc.lat,
      lng: loc.lng,
    })
  )
}

export function clearStoredShoppingLocation() {
  localStorage.removeItem(KEY)
}

/**
 * When the user profile loads from the API, mirror coords to localStorage for public pages.
 * @param {{ customerLocation?: { label?: string, lat?: number, lng?: number } | null } | null} user
 */
export function syncStoredFromServerUser(user) {
  const c = user?.customerLocation
  if (!c || c.lat == null || c.lng == null || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) {
    return
  }
  setStoredShoppingLocation({
    label: String(c.label ?? ''),
    lat: c.lat,
    lng: c.lng,
  })
}
