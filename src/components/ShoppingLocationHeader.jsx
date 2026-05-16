import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiCrosshair, FiMapPin, FiTrash2 } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useEffectiveShoppingLocation } from '../hooks/useEffectiveShoppingLocation'
import { clearStoredShoppingLocation, setStoredShoppingLocation } from '../utils/customerLocation'
import { notifyShoppingLocationChanged } from '../utils/shoppingLocationSync'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function truncate(str, max = 36) {
  const s = String(str ?? '').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

/**
 * Functional replacement for the old static “Lahore, Pakistan” header dropdown —
 * searches places, saves to profile (customers) or this device (guests), and syncs vendors list.
 */
export default function ShoppingLocationHeader() {
  const { user, token, mergeUserFromServer } = useAuth()
  const effectiveLocation = useEffectiveShoppingLocation()
  const isCustomer = user?.role === 'customer'

  const [open, setOpen] = useState(false)
  const [locQuery, setLocQuery] = useState('')
  const [locSuggestions, setLocSuggestions] = useState([])
  const [locBusy, setLocBusy] = useState(false)
  const [locMsg, setLocMsg] = useState('')
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    const q = locQuery.trim()
    if (!open || q.length < 2) {
      setLocSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/api/geo/search`, { params: { q } })
        setLocSuggestions(data.results || [])
      } catch {
        setLocSuggestions([])
      }
    }, 380)
    return () => clearTimeout(t)
  }, [locQuery, open])

  const applyShoppingLocation = async (loc) => {
    const label = String(loc.label ?? '').slice(0, 500)
    let lat = loc.lat
    let lng = loc.lng
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return

    setLocMsg('')
    setLocBusy(true)
    try {
      if (isCustomer && token) {
        const { data } = await axios.patch(
          `${API}/api/auth/me/location`,
          { label: label || undefined, lat, lng },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        mergeUserFromServer(data.user)
        const saved = data.user.customerLocation
        if (saved?.lat != null && saved?.lng != null) setStoredShoppingLocation(saved)
      } else {
        setStoredShoppingLocation({ label, lat, lng })
      }
      notifyShoppingLocationChanged()
      setLocQuery('')
      setLocSuggestions([])
      setOpen(false)
    } catch (err) {
      setLocMsg(err.response?.data?.message || 'Could not save location.')
    } finally {
      setLocBusy(false)
    }
  }

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocMsg('Location isn’t supported in this browser.')
      return
    }
    setLocBusy(true)
    setLocMsg('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const { data } = await axios.post(`${API}/api/geo/reverse`, { lat, lng })
          const resolved = data.location
          await applyShoppingLocation({
            label: resolved?.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat: resolved.lat,
            lng: resolved.lng,
          })
        } catch {
          await applyShoppingLocation({
            label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat,
            lng,
          })
        }
      },
      () => {
        setLocMsg('Allow location access, or type a city below.')
        setLocBusy(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    )
  }

  const clearLocation = async () => {
    setLocBusy(true)
    setLocMsg('')
    try {
      clearStoredShoppingLocation()
      if (isCustomer && token) {
        const { data } = await axios.patch(
          `${API}/api/auth/me/location`,
          { clear: true },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        mergeUserFromServer(data.user)
      }
      notifyShoppingLocationChanged()
      setOpen(false)
    } catch (err) {
      setLocMsg(err.response?.data?.message || 'Could not clear location.')
    } finally {
      setLocBusy(false)
    }
  }

  const display =
    effectiveLocation?.label?.trim() ||
    (effectiveLocation ? `${effectiveLocation.lat?.toFixed(3)}, ${effectiveLocation.lng?.toFixed(3)}` : '')
  const subtitle =
    effectiveLocation?.source === 'account' ? 'Saved on your account' : 'Saved on this device'

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          setLocMsg('')
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="text-black flex items-center gap-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 px-2 py-1.5 transition max-w-[200px]"
        title={
          effectiveLocation
            ? `Shopping area (${subtitle}). Click to change.`
            : 'Set shopping area — used for nearby vendors'
        }
      >
        <FiMapPin size={16} className="text-blue-600 shrink-0" />
        <span className="truncate min-w-0">
          {effectiveLocation ? truncate(display, 32) : 'Set shopping area'}
        </span>
        <FiChevronDown size={16} className="text-gray-500 shrink-0 ml-0.5" aria-hidden />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[min(calc(100vw-2rem),20rem)] z-[100] rounded-xl border border-gray-200 bg-white py-3 px-3 shadow-xl"
          role="dialog"
          aria-label="Choose shopping area"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Shopping area</p>
          {effectiveLocation ? (
            <>
              <p className="text-sm text-gray-900 line-clamp-2">{display}</p>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Pick where you&apos;re browsing from so we can estimate nearby vendors on the{' '}
              <Link className="text-blue-600 font-medium hover:underline" to="/vendors" onClick={() => setOpen(false)}>
                vendors
              </Link>{' '}
              page.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useBrowserLocation}
              disabled={locBusy}
              className="inline-flex flex-1 min-w-[7rem] items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <FiCrosshair size={14} />
              {locBusy ? 'Working…' : 'Use GPS'}
            </button>
            {effectiveLocation && (
              <button
                type="button"
                onClick={clearLocation}
                disabled={locBusy}
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              >
                <FiTrash2 size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="mt-3">
            <label className="sr-only" htmlFor="hdr-loc-q">
              Search place
            </label>
            <input
              id="hdr-loc-q"
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              placeholder="Search city / area…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {locSuggestions.length > 0 && (
              <ul className="mt-1 max-h-40 overflow-auto rounded-lg border border-gray-200 bg-gray-50 text-sm">
                {locSuggestions.map((s, i) => (
                  <li key={`${s.lat}-${s.lng}-${i}`}>
                    <button
                      type="button"
                      disabled={locBusy}
                      className="w-full px-3 py-2 text-left text-gray-900 hover:bg-white disabled:opacity-50 line-clamp-2"
                      onClick={() =>
                        applyShoppingLocation({ label: s.label, lat: s.lat, lng: s.lng })
                      }
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {locMsg && <p className="mt-2 text-xs font-medium text-amber-700">{locMsg}</p>}

          <Link
            to="/vendors"
            onClick={() => setOpen(false)}
            className="mt-3 block text-center text-xs font-semibold text-blue-600 hover:underline"
          >
            Open vendors & nearby shops →
          </Link>

          {isCustomer ? (
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              Also saved under <span className="font-medium">Profile → Shopping location</span>
            </p>
          ) : (
            !user && (
              <p className="mt-2 text-[11px] text-gray-400 text-center">
                Sign in as a customer to sync this location to your profile.
              </p>
            )
          )}
        </div>
      )}
    </div>
  )
}
