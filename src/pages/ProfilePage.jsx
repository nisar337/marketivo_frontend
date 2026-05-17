import { useRef, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import {
  FiUser,
  FiMail,
  FiShoppingBag,
  FiPackage,
  FiChevronRight,
  FiHome,
  FiPhone,
  FiEdit3,
  FiShield,
  FiCamera,
  FiTrash2,
  FiLayout,
  FiMapPin,
  FiCrosshair,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'
import ModernLoader from '../components/ModernLoader'
import VerifiedBadge from '../components/VerifiedBadge'
import { clearStoredShoppingLocation, setStoredShoppingLocation } from '../utils/customerLocation'
import { notifyShoppingLocationChanged } from '../utils/shoppingLocationSync'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function initials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const { user, token, mergeUserFromServer } = useAuth()
  const [searchParams] = useSearchParams()
  const showEditHint = searchParams.get('edit') === 'true'
  const fileInputRef = useRef(null)
  const vendorLogoRef = useRef(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [vendorForm, setVendorForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    website: '',
    businessAddress: '',
  })
  const [vendorFormSaving, setVendorFormSaving] = useState(false)
  const [vendorFormMsg, setVendorFormMsg] = useState('')

  const [custLocQuery, setCustLocQuery] = useState('')
  const [custLocSuggestions, setCustLocSuggestions] = useState([])
  const [custLocBusy, setCustLocBusy] = useState(false)
  const [custLocMsg, setCustLocMsg] = useState('')

  const isCustomer = user?.role === 'customer'
  const isVendor = user?.role === 'vendor' || user?.role === 'admin'
  const vendorShop = isVendor && user?.vendor ? user.vendor : null

  useEffect(() => {
    if (!vendorShop) return
    setVendorForm({
      storeName: vendorShop.storeName || '',
      description: vendorShop.description || '',
      phone: vendorShop.phone || '',
      website: vendorShop.website || '',
      businessAddress: vendorShop.businessAddress || '',
    })
  }, [
    vendorShop?.storeName,
    vendorShop?.description,
    vendorShop?.phone,
    vendorShop?.website,
    vendorShop?.businessAddress,
    vendorShop?._id,
  ])

  useEffect(() => {
    if (!isCustomer) return
    const q = custLocQuery.trim()
    if (q.length < 2) {
      setCustLocSuggestions([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/api/geo/search`, { params: { q } })
        setCustLocSuggestions(data.results || [])
      } catch {
        setCustLocSuggestions([])
      }
    }, 380)
    return () => clearTimeout(t)
  }, [custLocQuery, isCustomer])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <ModernLoader size={64} label="Loading profile…" />
      </div>
    )
  }

  const roleLabel =
    user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendor' : 'Customer'
  const avatarUrl = user.avatarUrl?.trim?.() ? user.avatarUrl : ''
  const shopLogoUrl = vendorShop?.logo?.trim?.() ? vendorShop.logo : ''
  const vendorCanEditShop = Boolean(vendorShop && showEditHint)

  const heroImageUrl = isCustomer ? avatarUrl : shopLogoUrl
  const heroInitialsSource = vendorShop?.storeName || user.name

  const pickPhoto = () => {
    setAvatarError('')
    fileInputRef.current?.click()
  }

  const onAvatarSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !token) return
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await axios.post(`${API}/api/auth/me/avatar`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer(data.user)
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Could not upload photo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const removeAvatar = async () => {
    if (!token || !avatarUrl) return
    if (!window.confirm('Remove your profile picture?')) return
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const { data } = await axios.delete(`${API}/api/auth/me/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer(data.user)
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Could not remove photo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const pickVendorLogo = () => {
    setAvatarError('')
    vendorLogoRef.current?.click()
  }

  const onVendorLogoSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !token || !vendorShop) return
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const { data } = await axios.post(`${API}/api/vendors/me/shop-logo`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer({ vendor: data.vendor })
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Could not upload shop logo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const removeVendorLogo = async () => {
    if (!token || !shopLogoUrl) return
    if (!window.confirm('Remove your shop logo?')) return
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const { data } = await axios.delete(`${API}/api/vendors/me/shop-logo`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer({ vendor: data.vendor })
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Could not remove shop logo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  const saveVendorDetails = async (e) => {
    e.preventDefault()
    if (!token || !vendorShop) return
    setVendorFormMsg('')
    setVendorFormSaving(true)
    try {
      const { data } = await axios.patch(`${API}/api/vendors/me`, vendorForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer({ vendor: data.vendor })
      setVendorFormMsg('Changes saved.')
    } catch (err) {
      setVendorFormMsg(err.response?.data?.message || 'Could not save shop details.')
    } finally {
      setVendorFormSaving(false)
    }
  }

  const persistCustomerShoppingLocation = async (payload) => {
    if (!token || user?.role !== 'customer') return
    setCustLocMsg('')
    setCustLocBusy(true)
    try {
      const { data } = await axios.patch(`${API}/api/auth/me/location`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      mergeUserFromServer(data.user)
      if (payload.clear) {
        clearStoredShoppingLocation()
      } else {
        setStoredShoppingLocation(data.user.customerLocation)
      }
      notifyShoppingLocationChanged()
      setCustLocMsg(data.message || 'Saved.')
    } catch (err) {
      setCustLocMsg(err.response?.data?.message || 'Could not update location.')
    } finally {
      setCustLocBusy(false)
    }
  }

  const useBrowserLocationAsCustomer = () => {
    if (!navigator.geolocation) {
      setCustLocMsg('Location is not supported in this browser.')
      return
    }
    setCustLocBusy(true)
    setCustLocMsg('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          const { data } = await axios.post(`${API}/api/geo/reverse`, { lat, lng })
          const loc = data.location
          if (!loc?.lat || !loc?.lng) {
            throw new Error('Reverse lookup failed.')
          }
          await persistCustomerShoppingLocation({
            label: loc.label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            lat: loc.lat,
            lng: loc.lng,
          })
          setCustLocQuery('')
          setCustLocSuggestions([])
        } catch (err) {
          setCustLocMsg(err.response?.data?.message || err.message || 'Could not resolve address.')
          setCustLocBusy(false)
        }
      },
      () => {
        setCustLocMsg(
          'We could not read your location. Allow location permission in the browser or search for an address below.'
        )
        setCustLocBusy(false)
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    )
  }

  return (
    <MarketingLayout activeNav="none">
      <div className="min-h-[60vh] bg-gradient-to-b from-sky-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {showEditHint && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex flex-wrap items-center gap-2">
              <FiEdit3 className="flex-shrink-0 text-blue-600" />
              <span>
                {isCustomer ? (
                  <>
                    Update your photo below. For name or email changes, reach out via{' '}
                    <Link to="/contact" className="font-semibold underline hover:text-blue-700">
                      Contact us
                    </Link>
                    .
                  </>
                ) : vendorShop ? (
                  <>
                    Use the form below to update your shop logo and details. For account email or name changes, contact{' '}
                    <Link to="/contact" className="font-semibold underline hover:text-blue-700">
                      support
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Full profile editing is coming soon. For account changes, reach out via{' '}
                    <Link to="/contact" className="font-semibold underline hover:text-blue-700">
                      Contact us
                    </Link>
                    .
                  </>
                )}
              </span>
            </div>
          )}

          {avatarError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{avatarError}</div>
          )}

          {/* Identity header */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-blue-100/40">
            <div className="h-28 md:h-36 bg-gradient-to-r from-blue-600 via-blue-500 to-green-600" aria-hidden />
            <div className="relative px-5 pb-8 pt-0 md:px-8">
              <div className="-mt-14 flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  aria-hidden
                  onChange={onAvatarSelected}
                />
                <input
                  ref={vendorLogoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  aria-hidden
                  onChange={onVendorLogoSelected}
                />
                <div className="relative shrink-0">
                  <div
                    className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg ring-1 ring-gray-100"
                  >
                    {heroImageUrl ? (
                      <img src={heroImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold tracking-tight text-blue-600" aria-hidden>
                        {initials(heroInitialsSource)}
                      </span>
                    )}
                    {avatarBusy && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <div className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      </div>
                    )}
                  </div>
                  {isCustomer && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={pickPhoto}
                        disabled={avatarBusy}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        <FiCamera size={14} />
                        {avatarUrl ? 'Change photo' : 'Upload photo'}
                      </button>
                      {!!avatarUrl && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          disabled={avatarBusy}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  {vendorCanEditShop && (
                    <div className="mt-3 flex flex-col gap-1">
                      <p className="text-xs font-medium text-gray-500">Shop logo</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={pickVendorLogo}
                          disabled={avatarBusy}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                        >
                          <FiCamera size={14} />
                          {shopLogoUrl ? 'Change shop logo' : 'Upload shop logo'}
                        </button>
                        {!!shopLogoUrl && (
                          <button
                            type="button"
                            onClick={removeVendorLogo}
                            disabled={avatarBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <FiTrash2 size={14} />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-3 gap-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{user.name}</h1>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : isVendor
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {roleLabel}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="text-gray-400 shrink-0" size={16} />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      to={isVendor ? '/vendor/dashboard' : '/'}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700"
                    >
                      {isVendor ? (
                        <>
                          Open dashboard <FiChevronRight size={18} />
                        </>
                      ) : (
                        <>
                          Continue shopping <FiChevronRight size={18} />
                        </>
                      )}
                    </Link>
                    {!isVendor && (
                      <Link
                        to="/orders"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
                      >
                        <FiPackage size={18} />
                        My orders
                      </Link>
                    )}
                    {vendorShop && !showEditHint && (
                      <Link
                        to="/profile?edit=true"
                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-800 shadow-sm transition hover:bg-green-100"
                      >
                        <FiEdit3 size={18} />
                        Edit shop profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Account details */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Account details</h2>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <ul className="divide-y divide-gray-100">
                  <li className="flex items-start gap-4 py-4 first:pt-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FiUser size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Full name</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">{user.name}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FiMail size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                      <p className="mt-1 break-all text-base font-semibold text-gray-900">{user.email}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 py-4 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                      <FiShield size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account type</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">{roleLabel}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {isVendor
                          ? 'You can manage products and orders from your vendor dashboard.'
                          : 'Shop from local vendors, track orders, and manage your cart.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {isCustomer && (
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:p-6">
                  <h3 className="text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
                    <FiMapPin className="text-blue-600 shrink-0" />
                    Shopping location
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    We use this to show vendors near you on the vendors page (distance is approximate). Choose a suburb
                    or your current area — you can update it anytime.
                  </p>
                  {custLocMsg && (
                    <p
                      className={`mt-4 text-sm ${
                        custLocMsg.startsWith('We could') ||
                        custLocMsg.startsWith('Location') ||
                        custLocMsg.startsWith('Could not')
                          ? 'text-amber-800'
                          : 'text-green-700'
                      }`}
                    >
                      {custLocMsg}
                    </p>
                  )}
                  {user.customerLocation?.lat != null &&
                  user.customerLocation?.lng != null &&
                  Number.isFinite(user.customerLocation.lat) &&
                  Number.isFinite(user.customerLocation.lng) ? (
                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Saved area</p>
                      <p className="mt-1 text-sm text-gray-900 break-words">
                        {user.customerLocation.label?.trim()
                          ? user.customerLocation.label
                          : `${user.customerLocation.lat.toFixed(4)}, ${user.customerLocation.lng.toFixed(4)}`}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">No location saved yet.</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={useBrowserLocationAsCustomer}
                      disabled={custLocBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FiCrosshair size={16} />
                      {custLocBusy ? 'Working…' : 'Use my current location'}
                    </button>
                    {user.customerLocation?.lat != null &&
                      user.customerLocation?.lng != null &&
                      Number.isFinite(user.customerLocation.lat) &&
                      Number.isFinite(user.customerLocation.lng) && (
                        <button
                          type="button"
                          onClick={() => persistCustomerShoppingLocation({ clear: true })}
                          disabled={custLocBusy}
                          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Clear saved location
                        </button>
                      )}
                  </div>
                  <div className="mt-6 relative">
                    <label htmlFor="custLocSearch" className="block text-sm font-medium text-gray-700">
                      Or search for a place
                    </label>
                    <input
                      id="custLocSearch"
                      value={custLocQuery}
                      onChange={(e) => setCustLocQuery(e.target.value)}
                      placeholder="City, suburb, postcode…"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    {custLocSuggestions.length > 0 && (
                      <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 text-sm shadow-lg">
                        {custLocSuggestions.map((s, idx) => (
                          <li key={`${s.lat}-${s.lng}-${idx}`}>
                            <button
                              type="button"
                              className="w-full px-3 py-2.5 text-left text-gray-900 hover:bg-blue-50"
                              onClick={async () => {
                                await persistCustomerShoppingLocation({
                                  label: s.label,
                                  lat: s.lat,
                                  lng: s.lng,
                                })
                                setCustLocQuery('')
                                setCustLocSuggestions([])
                              }}
                            >
                              <span className="line-clamp-2">{s.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-gray-400">
                    Address search powered by OpenStreetMap. Saved only on your Marketivo profile.
                  </p>
                </div>
              )}

              {isVendor && user.vendor && (
                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/80 to-white p-5 shadow-sm md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {shopLogoUrl ? (
                      <img
                        src={shopLogoUrl}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-xl border border-green-200 object-cover bg-white"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-green-200 bg-white text-xs font-medium text-gray-500">
                        No logo
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
                        <FiShoppingBag className="text-green-600" />
                        Store profile
                        {(vendorShop.verified ?? vendorShop.status === 'approved') && <VerifiedBadge />}
                        {vendorShop.status === 'pending' && (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                            Pending verification
                          </span>
                        )}
                      </h3>
                      {(vendorShop.verified ?? vendorShop.status === 'approved') && (
                        <p className="mt-2 text-sm text-gray-600">
                          Your shop is{' '}
                          <span className="font-semibold text-green-600">verified</span> — customers see a
                          trusted badge on your store.
                        </p>
                      )}
                      <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Store name</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">{user.vendor.storeName || '—'}</p>
                    </div>
                    {user.vendor.description ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
                        <p className="mt-2 text-sm leading-relaxed text-gray-700">{user.vendor.description}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No store description yet.</p>
                    )}
                    {!showEditHint && (
                      <>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business phone</p>
                          <p className="mt-1 text-sm text-gray-900">{user.vendor.phone?.trim() || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Website</p>
                          <p className="mt-1 text-sm text-gray-900 break-all">
                            {user.vendor.website?.trim() ? (
                              <a href={user.vendor.website.startsWith('http') ? user.vendor.website : `https://${user.vendor.website}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                {user.vendor.website}
                              </a>
                            ) : (
                              '—'
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Business address</p>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{user.vendor.businessAddress?.trim() || '—'}</p>
                        </div>
                      </>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vendorCanEditShop && (
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm md:p-6">
                  <h3 className="text-lg font-bold text-gray-900">Edit shop details</h3>
                  <p className="mt-1 text-sm text-gray-600">Update how shoppers see your store.</p>
                  <form onSubmit={saveVendorDetails} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                        Store name
                      </label>
                      <input
                        id="storeName"
                        required
                        value={vendorForm.storeName}
                        onChange={(e) => setVendorForm((f) => ({ ...f, storeName: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Store description
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        value={vendorForm.description}
                        onChange={(e) => setVendorForm((f) => ({ ...f, description: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="Tell customers about your shop"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Business phone
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm((f) => ({ ...f, phone: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="+92 ..."
                      />
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website or social link
                      </label>
                      <input
                        id="website"
                        value={vendorForm.website}
                        onChange={(e) => setVendorForm((f) => ({ ...f, website: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="https:// or @instagram"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                        Business address
                      </label>
                      <textarea
                        id="businessAddress"
                        rows={2}
                        value={vendorForm.businessAddress}
                        onChange={(e) => setVendorForm((f) => ({ ...f, businessAddress: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        placeholder="Street, city (shown to customers if you add it)"
                      />
                    </div>
                    {vendorFormMsg && (
                      <p className={`text-sm ${vendorFormMsg.startsWith('Could') ? 'text-red-600' : 'text-green-700'}`}>{vendorFormMsg}</p>
                    )}
                    <button
                      type="submit"
                      disabled={vendorFormSaving}
                      className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {vendorFormSaving ? 'Saving…' : 'Save changes'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick links — customer-focused */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Shortcuts</h2>
              <nav className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
                {isVendor && (
                  <Link
                    to="/vendor/dashboard"
                    className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-3">
                      <FiLayout className="text-green-600" size={20} />
                      Vendor dashboard
                    </span>
                    <FiChevronRight className="text-gray-400" />
                  </Link>
                )}
                {!isVendor && (
                  <>
                    <Link
                      to="/cart"
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-3">
                        <FiShoppingBag className="text-blue-600" size={20} />
                        Shopping cart
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                    >
                      <span className="flex items-center gap-3">
                        <FiPackage className="text-blue-600" size={20} />
                        Order history
                      </span>
                      <FiChevronRight className="text-gray-400" />
                    </Link>
                  </>
                )}
                <Link
                  to="/"
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <FiHome className="text-green-600" size={20} />
                    Home
                  </span>
                  <FiChevronRight className="text-gray-400" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  <span className="flex items-center gap-3">
                    <FiPhone className="text-blue-600" size={20} />
                    Help & contact
                  </span>
                  <FiChevronRight className="text-gray-400" />
                </Link>
              </nav>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-950">
                <p className="font-semibold text-blue-900">Need something changed?</p>
                <p className="mt-1 text-blue-800/90">
                  Our team can help with account questions. Visit{' '}
                  <Link to="/contact" className="font-semibold underline hover:text-blue-950">
                    Contact us
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
