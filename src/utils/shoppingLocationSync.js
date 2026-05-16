/** Cross-component sync when shopping area changes (guest localStorage updates don’t bump React auth state). */
export const LOCATION_SYNC_EVENT = 'marketivo-shopping-location-changed'

export function notifyShoppingLocationChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LOCATION_SYNC_EVENT))
}
