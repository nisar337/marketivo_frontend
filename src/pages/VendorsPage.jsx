import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiSearch,
  FiCrosshair,
  FiNavigation,
  FiUser,
  FiTrash2,
} from 'react-icons/fi'
import { MdStorefront } from 'react-icons/md'
import MarketingLayout from '../components/MarketingLayout'
import VerifiedBadge from '../components/VerifiedBadge'
import { useAuth } from '../context/AuthContext'
import {
  clearStoredShoppingLocation,
  setStoredShoppingLocation,
} from '../utils/customerLocation'
import { useEffectiveShoppingLocation } from '../hooks/useEffectiveShoppingLocation'
import { notifyShoppingLocationChanged } from '../utils/shoppingLocationSync'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function truncateLabel(label, max = 72) {
  const s = String(label ?? '').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

export default function VendorsPage() {
  const { user, token, mergeUserFromServer } = useAuth()
  const [allVendors, setAllVendors] = useState([])
  const [nearbyList, setNearbyList] = useState([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [loadingNearby, setLoadingNearby] = useState(false)
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(false)

  const [listMode, setListMode] = useState('all')
  const [radiusKm, setRadiusKm] = useState(25)

  const [locQuery, setLocQuery] = useState('')
  const [locSuggestions, setLocSuggestions] = useState([])
  const [locBusy, setLocBusy] = useState(false)
  const [locMsg, setLocMsg] = useState('')
  const [showLocPanel, setShowLocPanel] = useState(false)

  const isCustomer = user?.role === 'customer'

  const effectiveLocation = useEffectiveShoppingLocation()

  useEffect(() => {
    setVisible(true)
    const fetchVendors = async () => {
      try {
        const { data } = await axios.get(`${API}/api/vendors`)
        setAllVendors(data.vendors || [])
      } catch (err) {
        console.error('Failed to load vendors:', err)
      } finally {
        setLoadingAll(false)
      }
    }
    fetchVendors()
  }, [])

  const refreshNearby = useCallback(
    async (coordsOverride = null) => {
      const lat = coordsOverride?.lat ?? effectiveLocation?.lat
      const lng = coordsOverride?.lng ?? effectiveLocation?.lng
      if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        setNearbyList([])
        return
      }
      setLoadingNearby(true)
      try {
        const { data } = await axios.get(`${API}/api/vendors/nearby`, {
          params: { lat, lng, radiusKm },
        })
        setNearbyList(data.vendors || [])
      } catch {
        setNearbyList([])
      } finally {
        setLoadingNearby(false)
      }
    },
    [effectiveLocation?.lat, effectiveLocation?.lng, radiusKm]
  )

  useEffect(() => {
    if (listMode !== 'nearby') return
    refreshNearby()
  }, [listMode, refreshNearby])

  useEffect(() => {
    const q = locQuery.trim()
    if (!showLocPanel || q.length < 2) {
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
  }, [locQuery, showLocPanel])

  const applyShoppingLocation = async (loc) => {
    const label = String(loc.label ?? '').slice(0, 500)
    const lat = loc.lat
    const lng = loc.lng
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
      setShowLocPanel(false)
      setLocMsg('')
      await refreshNearby({ lat, lng })
    } catch (err) {
      setLocMsg(err.response?.data?.message || 'Could not save location.')
    } finally {
      setLocBusy(false)
    }
  }

  const useBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocMsg('Location is not supported in this browser.')
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
        setLocMsg('Allow browser location permission, or pick a place from search.')
        setLocBusy(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    )
  }

  const clearLocalLocationOnly = async () => {
    clearStoredShoppingLocation()
    if (isCustomer && token) {
      setLocBusy(true)
      setLocMsg('')
      try {
        const { data } = await axios.patch(
          `${API}/api/auth/me/location`,
          { clear: true },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        mergeUserFromServer(data.user)
      } catch (err) {
        setLocMsg(err.response?.data?.message || 'Could not clear location.')
      } finally {
        setLocBusy(false)
      }
    }
    notifyShoppingLocationChanged()
    setNearbyList([])
    setListMode('all')
  }

  const displayVendors =
    listMode === 'nearby' && effectiveLocation?.lat != null ? nearbyList : allVendors

  const filteredVendors = displayVendors.filter(
    (vendor) =>
      vendor.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.description?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.businessAddress?.toLowerCase().includes(search.toLowerCase())
  )

  const listingBusy =
    listMode === 'nearby'
      ? loadingNearby || (loadingAll && nearbyList.length === 0 && allVendors.length === 0)
      : loadingAll

  return (
    <MarketingLayout activeNav="vendors">
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-gray-700  text-white py-4">
          <div
            className={`max-w-7xl mx-auto px-4 transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Vendors</h1>
                <p className="text-blue-100 max-w-xl">
                  Discover local shops verified by Marketivo. Set your area to prioritize nearby stores.
                </p>
              </div>
              <Link
                to="/profile"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/15 transition"
              >
                <FiUser size={17} />
                {isCustomer ? 'Profile & saved location' : 'Sign in for saved location'}
              </Link>
            </div>

            {/* Location bar */}
            <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <FiMapPin className="mt-0.5 shrink-0 opacity-95" size={22} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/90">
                      Your browsing area
                    </p>
                    {effectiveLocation ? (
                      <>
                        <p className="mt-1 text-sm font-semibold text-white truncate">
                          {truncateLabel(effectiveLocation.label)}
                        </p>
                        <p className="text-xs text-blue-100/85">
                          {effectiveLocation.source === 'account'
                            ? 'Synced with your account'
                            : 'Saved on this device only'}
                          {isCustomer && effectiveLocation.source === 'device' && (
                            <span className="ml-1">— opening profile saves it to your account.</span>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-blue-50">
                        Add where you&apos;re shopping to see approximate distances (optional).
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLocPanel(!showLocPanel)
                      setLocMsg('')
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    <FiCrosshair size={14} />
                    {effectiveLocation ? 'Change area' : 'Set area'}
                  </button>
                  {effectiveLocation && (
                    <>
                      <button
                        type="button"
                        onClick={useBrowserLocation}
                        disabled={locBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 disabled:opacity-50"
                      >
                        <FiNavigation size={14} />
                        Use GPS
                      </button>
                      <button
                        type="button"
                        onClick={clearLocalLocationOnly}
                        disabled={locBusy}
                        className="inline-flex items-center gap-2 rounded-xl bg-transparent px-3 py-2 text-xs font-semibold text-blue-50 ring-1 ring-white/30 hover:bg-white/10 disabled:opacity-50"
                      >
                        <FiTrash2 size={14} />
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showLocPanel && (
                <div className="mt-4 border-t border-white/15 pt-4">
                  <p className="text-xs text-blue-100">Search any city or suburb worldwide (OpenStreetMap).</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={useBrowserLocation}
                      disabled={locBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500 disabled:opacity-50"
                    >
                      <FiCrosshair size={14} />
                      {locBusy ? 'Please wait…' : 'Detect with GPS'}
                    </button>
                  </div>
                  <div className="relative mt-3">
                    <input
                      type="text"
                      value={locQuery}
                      onChange={(e) => setLocQuery(e.target.value)}
                      placeholder="Type to search places…"
                      className="w-full rounded-xl border border-white/25 bg-black/25 px-3 py-2.5 text-sm text-white placeholder:text-blue-100/75 focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                    />
                    {locSuggestions.length > 0 && (
                      <ul className="absolute z-30 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-blue-900/40 bg-white py-1 text-sm shadow-xl">
                        {locSuggestions.map((s, i) => (
                          <li key={`${s.lat}-${s.lng}-${i}`}>
                            <button
                              type="button"
                              disabled={locBusy}
                              className="w-full px-3 py-2.5 text-left text-gray-900 hover:bg-blue-50 disabled:opacity-50"
                              onClick={() =>
                                applyShoppingLocation({ label: s.label, lat: s.lat, lng: s.lng })
                              }
                            >
                              <span className="line-clamp-2">{s.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {locMsg && <p className="mt-2 text-xs font-medium text-amber-200">{locMsg}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div
            className={`mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-600">Browse:</span>
              <button
                type="button"
                disabled={!effectiveLocation?.lat || !effectiveLocation?.lng}
                onClick={() => setListMode('nearby')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition disabled:opacity-40 ${
                  listMode === 'nearby'
                    ? 'bg-blue-600 text-white ring-blue-600'
                    : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
                }`}
              >
                Nearby
              </button>
              <button
                type="button"
                onClick={() => setListMode('all')}
                className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                  listMode === 'all'
                    ? 'bg-blue-600 text-white ring-blue-600'
                    : 'bg-white text-gray-800 ring-gray-200 hover:bg-gray-50'
                }`}
              >
                All vendors
              </button>

              {listMode === 'nearby' && (
                <>
                  <span className="hidden sm:inline mx-2 h-6 w-px bg-gray-200" aria-hidden />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium whitespace-nowrap">Within</span>
                    <select
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 bg-white shadow-sm"
                    >
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                      <option value={200}>200 km</option>
                    </select>
                  </label>
                </>
              )}
            </div>

            <div className="relative max-w-md flex-1 min-w-[200px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Filter by name or area…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {listMode === 'nearby' && !effectiveLocation?.lat ? (
            <div
              className={`rounded-2xl border border-amber-200 bg-amber-50 px-4 py-10 text-center text-amber-900 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <MdStorefront size={40} className="mx-auto text-amber-700/70 mb-2" />
              <p className="font-semibold">Set your area to browse nearby vendors</p>
              <p className="mt-2 text-sm text-amber-900/85 max-w-lg mx-auto">
                Use GPS or search above — we match against each shop&apos;s business address coordinates.
              </p>
            </div>
          ) : listingBusy ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredVendors.length === 0 ? (
            <div
              className={`text-center py-16 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <MdStorefront size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {listMode === 'nearby'
                  ? `No mapped vendors within ${radiusKm} km. Try widening the radius or browsing all vendors.`
                  : search
                    ? 'No vendors match your filters.'
                    : 'No vendors available yet.'}
              </p>
              {listMode === 'nearby' && filteredVendors.length === 0 && (
                <button
                  type="button"
                  onClick={() => setListMode('all')}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Browse all vendors
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor, i) => (
                <Link
                  key={vendor._id}
                  to={`/vendor/${vendor.userId}`}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 group opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
                  style={{ animationDelay: `${(i % 6) * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {vendor.logo ? (
                        <img src={vendor.logo} alt={vendor.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <MdStorefront size={32} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {vendor.storeName}
                        </h3>
                        {(vendor.verified ?? vendor.status === 'approved') && <VerifiedBadge />}
                        {typeof vendor.distanceKm === 'number' && (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            ~{vendor.distanceKm} km
                          </span>
                        )}
                      </div>
                      {Number.isFinite(vendor.lat) && Number.isFinite(vendor.lng) && (
                        <p className="text-xs text-gray-500 mt-0.5 font-mono">
                          {vendor.lat.toFixed(5)}, {vendor.lng.toFixed(5)}
                        </p>
                      )}
                      {vendor.businessAddress && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FiMapPin size={14} />
                          <span className="truncate">{vendor.businessAddress}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {vendor.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vendor.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {vendor.phone && (
                      <span className="flex items-center gap-1">
                        <FiPhone size={14} />
                        {vendor.phone}
                      </span>
                    )}
                    {vendor.website && (
                      <span className="flex items-center gap-1">
                        <FiGlobe size={14} />
                        Website
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-blue-600 font-semibold text-sm group-hover:underline">
                      View Store & Products →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MarketingLayout>
  )
}
