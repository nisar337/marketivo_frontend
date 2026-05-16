import { useEffect, useMemo, useReducer } from 'react'
import { useAuth } from '../context/AuthContext'
import { getStoredShoppingLocation } from '../utils/customerLocation'
import { LOCATION_SYNC_EVENT } from '../utils/shoppingLocationSync'

/**
 * Resolved shopping area: account preference for customers, else device-local storage.
 */
export function useEffectiveShoppingLocation() {
  const { user } = useAuth()
  const [tick, bumpTick] = useReducer((n) => n + 1, 0)

  useEffect(() => {
    const onSync = () => bumpTick()
    window.addEventListener(LOCATION_SYNC_EVENT, onSync)
    return () => window.removeEventListener(LOCATION_SYNC_EVENT, onSync)
  }, [])

  return useMemo(() => {
    const srv = user?.customerLocation
    if (
      srv &&
      srv.lat != null &&
      srv.lng != null &&
      Number.isFinite(srv.lat) &&
      Number.isFinite(srv.lng)
    ) {
      return { label: srv.label || '', lat: srv.lat, lng: srv.lng, source: 'account' }
    }
    const g = getStoredShoppingLocation()
    if (g) return { ...g, source: 'device' }
    return null
  }, [user?.customerLocation?.lat, user?.customerLocation?.lng, user?.customerLocation?.label, tick])
}
