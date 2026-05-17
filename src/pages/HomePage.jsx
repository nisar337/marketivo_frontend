import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { FiShoppingCart, FiMessageCircle, FiMapPin, FiSearch, FiHome, FiGrid, FiUsers, FiTag, FiInfo, FiPhone, FiCheck, FiCheckCircle, FiLock, FiRotateCcw, FiHeadphones, FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiEye, FiEyeOff, FiSun, FiMoon, FiUser, FiEdit, FiLogOut, FiLayout, FiChevronDown, FiX } from 'react-icons/fi'
import { resolveAfterLogin } from '../utils/postLogin'
import LogoutConfirmation from '../components/LogoutConfirmation'
import ShoppingLocationHeader from '../components/ShoppingLocationHeader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function HomePage() {
  const { user, logout, login } = useAuth()
  const { addToCart, cartCount } = useCart()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
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

  const handleHeaderCategorySelect = (cat) => {
    setShowCategoryMenu(false)
    setCategorySearch('')
    if (cat) {
      setSelectedCategory(cat._id)
      navigate(`/categories?cat=${cat._id}`)
    } else {
      setSelectedCategory('')
    }
  }

  const filteredHeaderCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const activeHeaderCategory = categories.find((c) => c._id === selectedCategory)
  const Brand = ({ size = 40, titleSizeClass = 'text-2xl', taglineSizeClass = 'text-xs', showTagline = true }) => (
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
        <path
          d="M16.5 41.5c-4.1 0-5.8-2.2 0-2.2 3.2 0 3.1 2.2 0 2.2Z"
          fill="#16a34a"
        />
        <path
          d="M31.5 41.5c4.1 0 5.8-2.2 0-2.2-3.2 0-3.1 2.2 0 2.2Z"
          fill="#16a34a"
        />
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

  const handleCloseModal = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowAuthModal(false)
      setIsClosing(false)
    }, 300)
  }

  useEffect(() => {
    if (location.state?.message) {
      setAlert(location.state.message)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!alert) return
    const timer = setTimeout(() => setAlert(''), 5000)
    return () => clearTimeout(timer)
  }, [alert])

  useEffect(() => {
    axios.get(`${API}/api/categories`).then(({ data }) => setCategories(data.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {}
        if (search) params.search = search
        if (selectedCategory) params.category = selectedCategory
        const { data } = await axios.get(`${API}/api/products`, { params })
        setProducts(data.products)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [search, selectedCategory])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    setShowLogoutModal(false)
    setShowProfileMenu(false)
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

  return (
    <div className="w-full bg-white overflow-x-hidden scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Brand />
          
          <div className="flex-1 mx-8 flex items-center gap-2">
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu((v) => !v)}
                className={`group flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg border bg-white text-gray-800 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${showCategoryMenu ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}`}
                aria-haspopup="listbox"
                aria-expanded={showCategoryMenu}
              >
                <FiGrid size={16} className="text-blue-600 transition-transform duration-200 group-hover:rotate-6" />
                <span className="font-medium truncate max-w-[160px]">
                  {activeHeaderCategory ? activeHeaderCategory.name : 'All Categories'}
                </span>
                <FiChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform duration-300 ${showCategoryMenu ? 'rotate-180 text-blue-600' : ''}`}
                />
              </button>

              {showCategoryMenu && (
                <div
                  className="absolute left-0 top-full mt-2 z-50 w-72 origin-top-left rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5"
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
                      onClick={() => handleHeaderCategorySelect(null)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-150 hover:bg-blue-50 hover:pl-5 ${!activeHeaderCategory ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-gray-700'}`}
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600">
                        <FiGrid size={14} />
                      </span>
                      <span className="flex-1">All Categories</span>
                      {!activeHeaderCategory && <FiCheckCircle size={16} className="text-blue-600" />}
                    </button>

                    {filteredHeaderCategories.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-gray-500">No categories match “{categorySearch}”</p>
                    ) : (
                      filteredHeaderCategories.map((c) => {
                        const active = activeHeaderCategory?._id === c._id
                        return (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => handleHeaderCategorySelect(c)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-all duration-150 hover:bg-blue-50 hover:pl-5 ${active ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-gray-700'}`}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600">
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
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); navigate(`/?q=${encodeURIComponent(search.trim())}`) } }}
              className="flex-1 px-4 py-2 text-black border border-gray-300 rounded-lg text-sm transition-all duration-200 "
            />
            <button
              type="button"
              onClick={() => navigate(`/?q=${encodeURIComponent(search.trim())}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <FiSearch size={16} />
              Search
            </button>
          </div>

          <div className="flex items-center gap-4">
            <ShoppingLocationHeader />
            {user?.role !== 'vendor' && user?.role !== 'admin' && (
              <Link to="/cart" className="relative text-blue-600 font-semibold flex items-center gap-1">
                <FiShoppingCart size={18} />
                {cartCount > 0 && <span className="ml-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>}
              </Link>
            )}
            <button className="text-gray-600 hover:text-gray-900">
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
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-white py-2 shadow-xl border border-gray-100 animate-fade-in">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiUser size={16} />
                          View Profile
                        </button>
                        <button
                          onClick={() => { navigate('/profile?edit=true'); setShowProfileMenu(false); }}
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
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </button>
                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex gap-6">
            <Link to="/" className="py-3  border-b-2 border-blue-600 text-gray-900 font-semibold flex items-center gap-2">
              <FiHome size={18} /> Home
            </Link>
            <Link to="/categories" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FiGrid size={18} /> Categories
            </Link>
            <Link to="/vendors" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FiUsers size={18} /> Vendors
            </Link>
            <Link to="/deals" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FiTag size={18} /> Deals
            </Link>
            <Link to="/about" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FiInfo size={18} /> About Us
            </Link>
            <Link to="/contact" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <FiPhone size={18} /> Contact Us
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <FiSun 
              size={16} 
              className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} 
            />
            <FiMoon 
              size={16} 
              className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} 
            />
          </button>
        </div>
      </div>

      {alert && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {alert}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
              Support Local.<br/>Shop Local.<br/><span className="text-green-600">Grow Together.</span>
            </h1>
            <p className="text-gray-700 mb-6">
              Marketivo connects you with trusted local vendors near you. Discover great products, amazing deals, and support your community.
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <FiShoppingCart size={18} /> Shop Now
              </button>
              <Link to="/vendors" className="border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                <FiSearch size={18} /> Explore Vendors
              </Link>
            </div>
          </div>
          <div className="relative h-64 bg-gradient-to-b from-blue-100 to-transparent rounded-lg flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Sky background */}
              <rect width="400" height="400" fill="url(#skyGradient)" />
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#e0f2fe', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#f0f9ff', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              {/* Buildings in background */}
              <rect x="20" y="180" width="60" height="120" fill="#cbd5e1" opacity="0.3" />
              <rect x="90" y="160" width="70" height="140" fill="#cbd5e1" opacity="0.3" />
              <rect x="300" y="190" width="60" height="110" fill="#cbd5e1" opacity="0.3" />
              <rect x="330" y="170" width="50" height="130" fill="#cbd5e1" opacity="0.3" />
              
              {/* Location pins */}
              <circle cx="80" cy="100" r="12" fill="#16a34a" />
              <circle cx="80" cy="100" r="8" fill="#22c55e" />
              <circle cx="280" cy="80" r="12" fill="#2563eb" />
              <circle cx="280" cy="80" r="8" fill="#3b82f6" />
              
              {/* Market stall */}
              <rect x="120" y="200" width="160" height="120" fill="#f5f5f5" stroke="#d4d4d4" strokeWidth="2" />
              
              {/* Stall roof */}
              <path d="M 120 200 L 200 140 L 280 200" fill="#16a34a" stroke="#15803d" strokeWidth="2" />
              <path d="M 130 200 L 200 155 L 270 200" fill="#22c55e" />
              
              {/* Stall poles */}
              <rect x="130" y="200" width="8" height="120" fill="#78350f" />
              <rect x="262" y="200" width="8" height="120" fill="#78350f" />
              
              {/* Vendor - man */}
              <circle cx="160" cy="240" r="18" fill="#f4a460" />
              {/* Vendor head */}
              <circle cx="160" cy="220" r="16" fill="#d4a574" />
              {/* Vendor body */}
              <rect x="150" y="240" width="20" height="35" fill="#22c55e" rx="3" />
              {/* Vendor arms */}
              <rect x="130" y="245" width="20" height="8" fill="#d4a574" rx="4" />
              <rect x="170" y="245" width="20" height="8" fill="#d4a574" rx="4" />
              {/* Vendor legs */}
              <rect x="152" y="275" width="6" height="25" fill="#1f2937" />
              <rect x="162" y="275" width="6" height="25" fill="#1f2937" />
              
              {/* Customer - woman */}
              <circle cx="260" cy="240" r="18" fill="#fbbf24" />
              {/* Customer head */}
              <circle cx="260" cy="220" r="16" fill="#f59e0b" />
              {/* Customer body */}
              <rect x="250" y="240" width="20" height="35" fill="#fbbf24" rx="3" />
              {/* Customer arms */}
              <rect x="230" y="245" width="20" height="8" fill="#f59e0b" rx="4" />
              <rect x="270" y="245" width="20" height="8" fill="#f59e0b" rx="4" />
              {/* Customer legs */}
              <rect x="252" y="275" width="6" height="25" fill="#1f2937" />
              <rect x="262" y="275" width="6" height="25" fill="#1f2937" />
              
              {/* Produce baskets */}
              <rect x="140" y="280" width="35" height="25" fill="#ea580c" stroke="#92400e" strokeWidth="1" />
              <rect x="225" y="280" width="35" height="25" fill="#ea580c" stroke="#92400e" strokeWidth="1" />
              
              {/* Vegetables/Fruits in baskets */}
              <circle cx="150" cy="275" r="4" fill="#dc2626" />
              <circle cx="160" cy="275" r="4" fill="#dc2626" />
              <circle cx="170" cy="275" r="4" fill="#dc2626" />
              <circle cx="235" cy="275" r="4" fill="#22c55e" />
              <circle cx="245" cy="275" r="4" fill="#22c55e" />
              <circle cx="255" cy="275" r="4" fill="#22c55e" />
            </svg>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <FiMapPin size={32} className="mx-auto mb-2 text-blue-600" />
          <p className="font-semibold text-gray-900">Local Vendors Near You</p>
        </div>
        <div className="text-center">
          <FiLock size={32} className="mx-auto mb-2 text-blue-600" />
          <p className="font-semibold text-gray-900">Secure Payments</p>
        </div>
        <div className="text-center">
          <FiShoppingCart size={32} className="mx-auto mb-2 text-blue-600" />
          <p className="font-semibold text-gray-900">Fast & Reliable Delivery</p>
        </div>
        <div className="text-center">
          <FiHeadphones size={32} className="mx-auto mb-2 text-blue-600" />
          <p className="font-semibold text-gray-900">24/7 Customer Support</p>
        </div>
      </div>

      {/* Shop by Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Categories</h2>
          <Link to="/categories" className="text-blue-600 font-semibold">View All Categories →</Link>
        </div>
        <div className="grid grid-cols-6 gap-4">
          {categories.slice(0, 6).map((c) => (
            <div key={c._id} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <FiGrid size={32} className="mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-600">120+ Products</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/deals" className="text-blue-600 font-semibold">View All Products →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {products.slice(0, 6).map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow block">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">No image</div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-gray-600">{p.category?.name || 'Product'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {p.discountPrice ? (
                      <>
                        <span className="font-bold text-gray-900">Rs. {p.discountPrice}</span>
                        <span className="text-xs text-gray-500 line-through">Rs. {p.price}</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">Rs. {p.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                    <span>⭐</span>
                    <span>4.5 (120)</span>
                  </div>
                  {user?.role !== 'vendor' && user?.role !== 'admin' && (
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stockQuantity < 1}
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 rounded disabled:opacity-50"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-slate-900 text-white py-6 my-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FiMessageCircle size={40} />
            <div>
              <h3 className="font-bold text-lg">Need Help? Ask Our AI Assistant</h3>
              <p className="text-sm text-gray-300">Get instant answers to your questions.</p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
            Chat Now →
          </button>
        </div>
      </div>

      {/* Trust Section */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <FiCheck size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900">Trusted Local Vendors</p>
          <p className="text-xs text-gray-600">Verified and reliable sellers</p>
        </div>
        <div className="text-center">
          <FiLock size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900">Secure Payments</p>
          <p className="text-xs text-gray-600">100% safe and secure</p>
        </div>
        <div className="text-center">
          <FiRotateCcw size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900">Easy Returns</p>
          <p className="text-xs text-gray-600">Hassle-free return policy</p>
        </div>
        <div className="text-center">
          <FiHeadphones size={32} className="mx-auto mb-2 text-green-600" />
          <p className="font-semibold text-gray-900">Customer Support</p>
          <p className="text-xs text-gray-600">We're here to help 24/7</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-5   mb-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brand size={28} titleSizeClass="text-sm " taglineSizeClass="text-xs" showTagline={false} />
            </div>
            <p className="text-xs text-gray-400 mb-2">Best choice for local vendors</p>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-white">
                <FiFacebook size={18} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <FiInstagram size={18} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <FiTwitter size={18} />
              </button>
              <button className="text-gray-400 hover:text-white">
                <FiLinkedin size={18} />
              </button>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Company</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link to="/about" className="hover:text-white">Careers</Link></li>
              <li><Link to="/about" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Support</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link to="/contact" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/about" className="hover:text-white">Shipping & Delivery</Link></li>
              <li><Link to="/contact" className="hover:text-white">Returns & Refunds</Link></li>
              <li><Link to="/about" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">For Vendors</p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li><Link to="/login/vendor" className="hover:text-white">Sell on Marketivo</Link></li>
              <li><Link to="/login/vendor" className="hover:text-white">Vendor Login</Link></li>
              <li><Link to="/registration" className="hover:text-white">Vendor Registration</Link></li>
              <li><Link to="/registration" className="hover:text-white">Vendor Support</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Newsletter</p>
            <p className="text-xs text-gray-400 mb-2">Subscribe for updates</p>
            <div className="flex mr-6">
              <input type="email" placeholder="Email" className="flex-1 px-2 py-1 bg-gray-800 text-white text-xs rounded-l" />
              <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-semibold rounded-r">Sub</button>
            </div>
          </div>
        </div>
        <div className="px-4 border-t border-gray-800 pt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Marketivo. All rights reserved.</p>
         
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`w-96 bg-white h-[70vh] shadow-2xl overflow-y-auto rounded-l-lg scrollbar-hide transform transition-all duration-300 ease-out ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`} style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="p-6 h-full flex flex-col">
              {/* Close Button */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
                >
                  ×
                </button>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
                <Brand size={34} titleSizeClass="text-lg" taglineSizeClass="text-xs" />
              </div>

              {/* Form */}
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
                  <>
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

                    {formData.role === 'vendor' && (
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
                  ) : (
                    authMode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>

                {/* Toggle Mode */}
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
