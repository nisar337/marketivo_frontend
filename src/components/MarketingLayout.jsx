import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import {
  FiShoppingCart,
  FiMessageCircle,
  FiSearch,
  FiHome,
  FiGrid,
  FiUsers,
  FiTag,
  FiInfo,
  FiPhone,
  FiCheck,
  FiLock,
  FiRotateCcw,
  FiHeadphones,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiEye,
  FiEyeOff,
  FiSun,
  FiMoon,
  FiUser,
  FiEdit,
  FiLogOut,
  FiLayout,
  FiMapPin,
  FiCheckCircle,
  FiChevronDown,
  FiX,
} from 'react-icons/fi'
import { resolveAfterLogin } from '../utils/postLogin'
import ShoppingLocationHeader from './ShoppingLocationHeader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function Brand({ size = 40, titleSizeClass = 'text-2xl', taglineSizeClass = 'text-xs', showTagline = true }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Marketivo"
        role="img"
        className="flex-shrink-0"
      >
        <path
          d="M24 44S9 29.8 9 18.5C9 10 15.7 3 24 3s15 7 15 15.5C39 29.8 24 44 24 44Z"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M16.5 41.5c-4.1 0-5.8-2.2 0-2.2 3.2 0 3.1 2.2 0 2.2Z" fill="#16a34a" />
        <path d="M31.5 41.5c4.1 0 5.8-2.2 0-2.2-3.2 0-3.1 2.2 0 2.2Z" fill="#16a34a" />
        <path
          d="M17 14h4l1.5 12.5h11L35 14H21"
          stroke="#16a34a"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M22 17.5h11.2" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M22.6 21h10" stroke="#16a34a" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="23.5" cy="31" r="1.7" fill="#16a34a" />
        <circle cx="30.8" cy="31" r="1.7" fill="#16a34a" />
      </svg>
      <div className="leading-tight">
        <p className={`font-bold ${titleSizeClass}`}>
          <span className="text-gray-900">Market</span>
          <span className="text-green-600">ivo</span>
        </p>
        {showTagline && <p className={`${taglineSizeClass} text-gray-500`}>Best choice for local vendors</p>}
      </div>
    </div>
  )
}

function navLinkClass(isActive) {
  return isActive
    ? 'py-3 border-b-2 border-blue-600 text-gray-900 font-semibold flex items-center gap-2'
    : 'py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2'
}

/**
 * Shared storefront chrome (header, nav, trust strip, footer, auth modal) for marketing pages.
 * @param {'home' | 'about' | 'contact' | 'none'} activeNav — use `'none'` for auth pages (no tab underline).
 */
export default function MarketingLayout({ activeNav = 'home', children, topBanner = null }) {
  const { user, logout, login } = useAuth()
  const { cartCount } = useCart()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'customer', storeName: '', description: '', lat: null, lng: null })
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')

  const captureGps = () => {
    setGpsError('')
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.')
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }))
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please allow location access to register as a vendor.'
            : 'Could not get your location. Please try again.'
        )
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categorySearch, setCategorySearch] = useState('')
  const categoryRef = useRef(null)

  useEffect(() => {
    if (!showCategoryMenu) return
    const onClick = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategoryMenu(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setShowCategoryMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [showCategoryMenu])

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat)
    setShowCategoryMenu(false)
    setCategorySearch('')
    if (cat) {
      navigate(`/categories?cat=${cat._id}`)
    }
  }

  const filteredCategoryList = categories.filter((c) =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    axios.get(`${API}/api/categories`).then(({ data }) => setCategories(data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    if (location.state?.message) {
      setAlert(location.state.message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!alert) return
    const t = setTimeout(() => setAlert(''), 5000)
    return () => clearTimeout(t)
  }, [alert])

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowAuthModal(false)
      setIsClosing(false)
    }, 300)
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
  }

  const handleSearch = () => {
    const q = search.trim()
    if (activeNav === 'home') {
      return
    }
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    if (authMode === 'register' && formData.role === 'vendor' && !formData.storeName?.trim()) {
      setAlert('Store name is required for vendor registration.')
      return
    }
    if (authMode === 'register' && formData.role === 'vendor' && (formData.lat == null || formData.lng == null)) {
      setAlert('Please capture your GPS location to register as a vendor.')
      return
    }
    setSubmitting(true)
    try {
      if (authMode === 'login') {
        const data = await login(formData.email, formData.password)
        handleCloseModal()
        setFormData({ email: '', password: '', name: '', role: 'customer', storeName: '', description: '', lat: null, lng: null })
        navigate(resolveAfterLogin(data.user, location.state?.from), { replace: true })
      } else {
        const response = await axios.post(`${API}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          storeName: formData.storeName,
          description: formData.description,
          lat: formData.lat,
          lng: formData.lng,
        })
        if (response.data.token) {
          const data = await login(formData.email, formData.password)
          handleCloseModal()
          setFormData({ email: '', password: '', name: '', role: 'customer', storeName: '', description: '', lat: null, lng: null })
          navigate(resolveAfterLogin(data.user, null), { replace: true })
        }
      }
    } catch (error) {
      setAlert(error.response?.data?.message || 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  const banner = topBanner ?? (
    alert && (
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{alert}</div>
      </div>
    )
  )

  return (
    <div className="w-full bg-white overflow-x-hidden scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <Link to="/">
            <Brand />
          </Link>

          <div className="flex-1 min-w-[200px] mx-4 flex items-center gap-2 flex-wrap">
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu((v) => !v)}
                className={`group flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg border bg-white text-gray-800 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${showCategoryMenu ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}`}
                aria-haspopup="listbox"
                aria-expanded={showCategoryMenu}
              >
                
                <span className="font-medium truncate max-w-[160px]">
                  {selectedCategory ? selectedCategory.name : 'All Categories'}
                </span>
                <FiChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-300 ${showCategoryMenu ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>

              {showCategoryMenu && (
                <div
                  className="absolute left-0 top-full mt-2 z-50 w-72 origin-top-left rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{ animation: 'cat-menu-in 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                  role="listbox"
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories…"
                        className="w-full pl-8 pr-8 py-2 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                          aria-label="Clear search"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1">
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(null)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-150 hover:bg-blue-50 hover:pl-5 ${!selectedCategory ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600">
                        <FiGrid size={14} />
                      </span>
                      <span className="flex-1">All Categories</span>
                      {!selectedCategory}
                    </button>

                    {filteredCategoryList.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-500">No categories match “{categorySearch}”</p>
                    ) : (
                      filteredCategoryList.map((c) => {
                        const active = selectedCategory?._id === c._id
                        return (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => handleSelectCategory(c)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-150 hover:bg-blue-50 hover:pl-5 ${active ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-gray-700'}`}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 group-hover:from-blue-100 group-hover:to-blue-50">
                              <FiGrid size={14} />
                            </span>
                            <span className="flex-1 truncate">{c.name}</span>
                            {active && <FiCheckCircle size={16} className="text-blue-600" />}
                          </button>
                        )
                      })
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-2">
                    <Link
                      to="/categories"
                      onClick={() => setShowCategoryMenu(false)}
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5"
                    >
                      <FiGrid size={14} />
                      Browse all categories
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Search for products, vendors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 min-w-[120px] px-4 py-2 text-black border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <FiSearch size={18} />
              Search
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ShoppingLocationHeader />
            {user?.role !== 'vendor' && user?.role !== 'admin' && (
              <Link to="/cart" className="relative text-blue-600 font-semibold flex items-center gap-1">
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="ml-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>
                )}
              </Link>
            )}
            <button type="button" className="text-gray-600 hover:text-gray-900">
              <FiMessageCircle size={18} />
            </button>
            {user && user.role !== 'admin' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105"
                >
                  {user.role === 'customer' && user.avatarUrl?.trim?.() ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (user.role === 'vendor' || user.role === 'admin') && user.vendor?.logo?.trim?.() ? (
                    <img src={user.vendor.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FiUser size={20} />
                  )}
                </button>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-white py-2 shadow-xl border border-gray-100 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/profile')
                            setShowProfileMenu(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiUser size={16} />
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/profile?edit=true')
                            setShowProfileMenu(false)
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiEdit size={16} />
                          Edit Profile
                        </button>
                        {user.role === 'vendor' && (
                          <button
                            type="button"
                            onClick={() => {
                              navigate('/vendor/dashboard')
                              setShowProfileMenu(false)
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FiLayout size={16} />
                            Dashboard
                          </button>
                        )}
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button type="button" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </button>
                <button type="button" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-6 lg:gap-8 flex-wrap">
            <Link to="/" className={navLinkClass(activeNav === 'home')}>
              <FiHome size={18} /> Home
            </Link>
            <Link to="/categories" className={navLinkClass(activeNav === 'categories')}>
              <FiGrid size={18} /> Categories
            </Link>
            <Link to="/vendors" className={navLinkClass(activeNav === 'vendors')}>
              <FiUsers size={18} /> Vendors
            </Link>
            <Link to="/deals" className={navLinkClass(activeNav === 'deals')}>
              <FiTag size={18} /> Deals
            </Link>
            <Link to="/about" className={navLinkClass(activeNav === 'about')}>
              <FiInfo size={18} /> About Us
            </Link>
            <Link to="/contact" className={navLinkClass(activeNav === 'contact')}>
              <FiPhone size={18} /> Contact Us
            </Link>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <FiSun size={16} className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
            <FiMoon size={16} className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
          </button>
        </div>
      </div>

      {banner}

      {children}

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100">
        <div className="text-center">
          <FiCheck size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900 text-sm">Trusted Local Vendors</p>
          <p className="text-xs text-gray-600">Verified and reliable sellers</p>
        </div>
        <div className="text-center">
          <FiLock size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900 text-sm">Secure Payments</p>
          <p className="text-xs text-gray-600">100% safe and secure</p>
        </div>
        <div className="text-center">
          <FiRotateCcw size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900 text-sm">Easy Returns</p>
          <p className="text-xs text-gray-600">Hassle-free return policy</p>
        </div>
        <div className="text-center">
          <FiHeadphones size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900 text-sm">24/7 Support</p>
          <p className="text-xs text-gray-600">We&apos;re here to help</p>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 mt-2">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 mb-6">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Brand size={28} titleSizeClass="text-sm" taglineSizeClass="text-xs" showTagline={false} />
            </div>
            <p className="text-xs text-gray-400 mb-3">Best choice for local vendors</p>
            <div className="flex gap-3">
              <button type="button" className="text-gray-400 hover:text-white" aria-label="Facebook">
                <FiFacebook size={18} />
              </button>
              <button type="button" className="text-gray-400 hover:text-white" aria-label="Instagram">
                <FiInstagram size={18} />
              </button>
              <button type="button" className="text-gray-400 hover:text-white" aria-label="Twitter">
                <FiTwitter size={18} />
              </button>
              <button type="button" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                <FiLinkedin size={18} />
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Company</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Careers
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Customer Service</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>
                <button type="button" className="hover:text-white text-left">
                  FAQs
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">For Vendors</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>
                <button type="button" className="hover:text-white text-left">
                  Sell on Marketivo
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Vendor Login
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Vendor Registration
                </button>
              </li>
              <li>
                <button type="button" className="hover:text-white text-left">
                  Vendor Support
                </button>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Newsletter</p>
            <p className="text-xs text-gray-400 mb-2">Subscribe for deals & updates</p>
            <div className="flex">
              <input type="email" placeholder="Email" className="flex-1 px-2 py-2 bg-gray-800 text-white text-xs rounded-l border border-gray-700" />
              <button type="button" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold rounded-r">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Marketivo. All rights reserved.</p>
          <div className="flex gap-2 text-[10px] text-gray-500 font-semibold tracking-wide">
            <span className="px-2 py-1 bg-gray-800 rounded">VISA</span>
            <span className="px-2 py-1 bg-gray-800 rounded">MC</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Pay</span>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`w-96 bg-white max-h-[85vh] shadow-2xl overflow-y-auto rounded-lg scrollbar-hide transform transition-all duration-300 ease-out ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                <button type="button" onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200">
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <Brand size={34} titleSizeClass="text-lg" taglineSizeClass="text-xs" />
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-3 flex-1 flex flex-col">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your name"
                      required={authMode === 'register'}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-1.5 pr-10 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>
                )}
                {authMode === 'register' && formData.role === 'vendor' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Store Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g. Fresh Corner Lahore"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Store Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Tell shoppers what you sell (optional)"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Store GPS Location <span className="text-red-500">*</span></label>
                      <p className="text-[11px] text-gray-600 mb-1">Required for admin approval so nearby shoppers can find you.</p>
                      <button
                        type="button"
                        onClick={captureGps}
                        disabled={gpsLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-800 shadow-sm hover:bg-green-50 disabled:opacity-60"
                      >
                        {gpsLoading ? (
                          <>
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
                            Getting location…
                          </>
                        ) : formData.lat != null && formData.lng != null ? (
                          <>
                            <FiCheckCircle size={14} />
                            Update GPS location
                          </>
                        ) : (
                          <>
                            <FiMapPin size={14} />
                            Use my current GPS
                          </>
                        )}
                      </button>
                      {formData.lat != null && formData.lng != null && (
                        <p className="mt-1 text-[11px] text-green-700">Captured: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}</p>
                      )}
                      {gpsError && <p className="mt-1 text-[11px] text-red-600">{gpsError}</p>}
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {authMode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : authMode === 'login' ? (
                    'Sign In'
                  ) : (
                    'Create Account'
                  )}
                </button>
                <div className="text-center pt-2 border-t border-gray-200 mt-auto">
                  <p className="text-xs text-gray-600">
                    {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === 'login' ? 'register' : 'login')
                        setFormData({ email: '', password: '', name: '', role: 'customer', storeName: '', description: '', lat: null, lng: null })
                      }}
                      className="text-blue-600 font-semibold hover:text-blue-700"
                    >
                      {authMode === 'login' ? 'Register' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
