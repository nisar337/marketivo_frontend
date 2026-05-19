import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import { FiShoppingCart, FiMessageCircle, FiMapPin, FiSearch, FiHome, FiGrid, FiUsers, FiTag, FiInfo, FiPhone, FiCheck, FiCheckCircle, FiLock, FiHeadphones, FiFacebook, FiInstagram, FiTwitter, FiLinkedin, FiEye, FiEyeOff, FiSun, FiMoon, FiUser, FiEdit, FiLogOut, FiLayout, FiChevronDown, FiX, FiTruck, FiBook, FiMonitor, FiHeart, FiStar, FiMenu } from 'react-icons/fi'
import { MdOutlineDirectionsCar, MdSportsBasketball } from 'react-icons/md'
import { resolveAfterLogin } from '../utils/postLogin'
import LogoutConfirmation from '../components/LogoutConfirmation'
import ModernLoader from '../components/ModernLoader'
import ShoppingLocationHeader from '../components/ShoppingLocationHeader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Inline dress icon (Fashion)
const DressIcon = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 3h6l-1 3 3 4-2 2 3 9H6l3-9-2-2 3-4-1-3z" />
  </svg>
)

// Inline gamepad icon (Toys & Games)
const GamepadIcon = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="17.5" cy="10" r="1" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
)

// Match a category by name to its display icon + color palette.
const HOME_CATEGORY_PRESETS = [
  { match: ['automotive', 'auto', 'car', 'vehicle'], bg: 'bg-blue-50', text: 'text-blue-500', Icon: MdOutlineDirectionsCar },
  { match: ['electronics', 'electronic', 'gadget', 'tech'], bg: 'bg-emerald-50', text: 'text-emerald-500', Icon: FiMonitor },
  { match: ['fashion', 'clothing', 'apparel', 'cloth'], bg: 'bg-pink-50', text: 'text-pink-500', Icon: DressIcon },
  { match: ['home', 'garden', 'furniture', 'kitchen'], bg: 'bg-orange-50', text: 'text-orange-500', Icon: FiHome },
  { match: ['health', 'beauty', 'wellness', 'cosmetic'], bg: 'bg-teal-50', text: 'text-teal-500', Icon: FiHeart },
  { match: ['sport', 'outdoor', 'fitness', 'gym'], bg: 'bg-purple-50', text: 'text-purple-500', Icon: MdSportsBasketball },
  { match: ['book', 'stationery', 'media'], bg: 'bg-amber-50', text: 'text-amber-500', Icon: FiBook },
  { match: ['toy', 'game', 'kids', 'baby'], bg: 'bg-sky-50', text: 'text-sky-500', Icon: GamepadIcon },
]

const HOME_CATEGORY_FALLBACKS = [
  { bg: 'bg-blue-50', text: 'text-blue-500', Icon: MdOutlineDirectionsCar },
  { bg: 'bg-emerald-50', text: 'text-emerald-500', Icon: FiMonitor },
  { bg: 'bg-pink-50', text: 'text-pink-500', Icon: DressIcon },
  { bg: 'bg-orange-50', text: 'text-orange-500', Icon: FiHome },
  { bg: 'bg-teal-50', text: 'text-teal-500', Icon: FiHeart },
  { bg: 'bg-purple-50', text: 'text-purple-500', Icon: MdSportsBasketball },
  { bg: 'bg-amber-50', text: 'text-amber-500', Icon: FiBook },
  { bg: 'bg-sky-50', text: 'text-sky-500', Icon: GamepadIcon },
]

function getHomeCategoryStyle(name, index) {
  const lower = String(name || '').toLowerCase()
  const matched = HOME_CATEGORY_PRESETS.find((preset) =>
    preset.match.some((token) => lower.includes(token))
  )
  if (matched) return matched
  return HOME_CATEGORY_FALLBACKS[index % HOME_CATEGORY_FALLBACKS.length]
}

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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
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
  const Brand = ({ size = 40, titleSizeClass = 'text-2xl', taglineSizeClass = 'text-xs', showTagline = true, dark = false }) => (
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
        <g transform="translate(-2 0)">
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
        </g>
      </svg>
      <div className="leading-tight">
        <p className={`font-bold ${titleSizeClass}`}>
          <span className={dark ? 'text-white' : 'text-gray-900'}>Market</span>
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 lg:gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>

          <Link to="/" className="flex-shrink-0">
            <Brand
              size={36}
              titleSizeClass="text-lg sm:text-xl lg:text-2xl"
              taglineSizeClass="text-[10px] sm:text-xs"
              showTagline={true}
            />
          </Link>

          {/* Desktop search + category */}
          <div className="hidden lg:flex flex-1 mx-4 lg:mx-8 items-center gap-2">
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryMenu((v) => !v)}
                className={`group flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg border bg-white text-gray-800 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${showCategoryMenu ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}`}
                aria-haspopup="listbox"
                aria-expanded={showCategoryMenu}
              >
               
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

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Mobile search button */}
            <button
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            <div className="hidden sm:block">
              <ShoppingLocationHeader />
            </div>
            {user?.role !== 'vendor' && user?.role !== 'admin' && (
              <Link to="/cart" className="relative text-blue-600 font-semibold flex items-center gap-1">
                <FiShoppingCart size={20} />
                {cartCount > 0 && <span className="absolute -right-2 -top-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{cartCount}</span>}
              </Link>
            )}
            <button className="hidden sm:inline-flex text-gray-600 hover:text-gray-900">
              <FiMessageCircle size={18} />
            </button>
            {user && user.role !== 'admin' ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105"
                >
                  {user.role === 'customer' && user.avatarUrl?.trim?.() ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (user.role === 'vendor' || user.role === 'admin') && user.vendor?.logo?.trim?.() ? (
                    <img src={user.vendor.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FiUser size={18} />
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
                <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="hidden sm:inline-flex text-sm text-gray-600 hover:text-gray-900">
                  Login
                </button>
                <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs (desktop & tablet) */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 lg:gap-6 whitespace-nowrap">
            <Link to="/" className="py-3 border-b-2 border-blue-600 text-gray-900 font-semibold flex items-center gap-2 text-sm lg:text-base">
              <FiHome size={18} /> Home
            </Link>
            <Link to="/categories" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm lg:text-base">
              <FiGrid size={18} /> Categories
            </Link>
            <Link to="/vendors" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm lg:text-base">
              <FiUsers size={18} /> Vendors
            </Link>
            <Link to="/deals" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm lg:text-base">
              <FiTag size={18} /> Deals
            </Link>
            <Link to="/about" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm lg:text-base">
              <FiInfo size={18} /> About Us
            </Link>
            <Link to="/contact" className="py-3 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm lg:text-base">
              <FiPhone size={18} /> Contact Us
            </Link>
          </div>
          <button
            onClick={toggleTheme}
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30"
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

      {/* Mobile Search Drawer */}
      {showMobileSearch && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileSearch(false)}>
          <div className="bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Close search"
              >
                <FiX size={22} />
              </button>
              <input
                type="text"
                autoFocus
                placeholder="Search for products, vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    navigate(`/?q=${encodeURIComponent(search.trim())}`)
                    setShowMobileSearch(false)
                  }
                }}
                className="flex-1 px-4 py-2.5 text-black border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  navigate(`/?q=${encodeURIComponent(search.trim())}`)
                  setShowMobileSearch(false)
                }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                aria-label="Submit search"
              >
                <FiSearch size={18} />
              </button>
            </div>
            <div className="mt-3 sm:hidden">
              <ShoppingLocationHeader />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <div
            className="relative bg-white w-72 max-w-[85vw] h-full shadow-2xl flex flex-col animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInLeft 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <Brand size={32} titleSizeClass="text-base" taglineSizeClass="text-[10px]" />
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <FiX size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {[
                { to: '/', label: 'Home', Icon: FiHome, active: true },
                { to: '/categories', label: 'Categories', Icon: FiGrid },
                { to: '/vendors', label: 'Vendors', Icon: FiUsers },
                { to: '/deals', label: 'Deals', Icon: FiTag },
                { to: '/about', label: 'About Us', Icon: FiInfo },
                { to: '/contact', label: 'Contact Us', Icon: FiPhone },
              ].map(({ to, label, Icon, active }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm ${active ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon size={18} /> {label}
                </Link>
              ))}
              <div className="my-2 border-t border-gray-200" />
              <Link
                to="/cart"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                <FiShoppingCart size={18} /> Cart{cartCount > 0 && ` (${cartCount})`}
              </Link>
              {!user && (
                <>
                  <button
                    type="button"
                    onClick={() => { setShowMobileMenu(false); setAuthMode('login'); setShowAuthModal(true); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiUser size={18} /> Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowMobileMenu(false); setAuthMode('register'); setShowAuthModal(true); }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FiEdit size={18} /> Register
                  </button>
                </>
              )}
            </nav>
            <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                aria-label="Toggle theme"
              >
                <FiSun size={16} className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                <FiMoon size={16} className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {alert}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50/60 to-indigo-50">
        {/* Decorative dot pattern */}
        <div
          className="pointer-events-none absolute right-10 top-12 hidden h-24 w-24 opacity-40 md:block"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-10 left-1/3 hidden h-20 w-20 opacity-40 md:block"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 py-2 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative">
          {/* Left: Copy */}
          <div className="relative z-10">
            {/* Support badge */}
           

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Support Local.<br />
              Shop Local.<br />
              <span className="text-green-600">Grow Together.</span>
            </h1>

            <p className="text-gray-600 max-w-md leading-relaxed mb-7">
              Marketivo connects you with trusted local vendors near you.
              Discover great products, amazing deals, and support your community.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/deals"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
              >
                <FiShoppingCart size={16} /> Shop Now
              </Link>
              <Link
                to="/vendors"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <FiUsers size={16} /> Explore Vendors
              </Link>
            </div>
          </div>

          {/* Right: Phone Mockup with floating cards */}
          <div className="relative h-[460px] hidden md:block">
            {/* Soft city silhouette behind */}
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-8 mx-auto  h-30 w-[90%] text-blue-100"
              viewBox="0 0 400 120"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="20" y="60" width="40" height="60" />
              <rect x="65" y="40" width="30" height="80" />
              <rect x="100" y="55" width="50" height="65" />
              <rect x="155" y="30" width="35" height="90" />
              <rect x="195" y="50" width="40" height="70" />
              <rect x="240" y="35" width="45" height="85" />
              <rect x="290" y="55" width="35" height="65" />
              <rect x="330" y="45" width="50" height="75" />
            </svg>

            {/* Phone */}
            <div className="absolute left-[30%] top-2 w-[260px] h-[440px] rounded-[2.5rem] bg-gray-900 p-2 shadow-2xl ring-1 ring-black/10">
              <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-white">
                {/* Notch */}
                <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-gray-900" />

                {/* Striped awning */}
                <div className="relative h-12 w-full overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(90deg, #2563eb 0 16px, #ffffff 16px 32px)',
                    }}
                  />
                  {/* Scallop bottom */}
                  <svg
                    className="absolute -bottom-px left-0 h-3 w-full text-white"
                    viewBox="0 0 260 12"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 0 Q 13 12 26 0 T 52 0 T 78 0 T 104 0 T 130 0 T 156 0 T 182 0 T 208 0 T 234 0 T 260 0 V12 H0 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Search bar */}
                <div className="px-3 pt-4">
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5">
                    <FiSearch size={11} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">Search products...</span>
                  </div>
                </div>

                {/* Category circles */}
                <div className="grid grid-cols-4 gap-2 px-3 pt-4">
                  <div className="flex aspect-square items-center justify-center rounded-full bg-blue-100 text-blue-500">
                    <DressIcon size={20} />
                  </div>
                  <div className="flex aspect-square items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 19c-4.97 0-9-4.03-9-9 0-1 .1-2 .3-2.9C8 8 11 12 11 19z" />
                      <path d="M11 19c5 0 11-3 11-12-7 1-11 5-11 12z" />
                    </svg>
                  </div>
                  <div className="flex aspect-square items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 8h14l-1 11H6L5 8z" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                    </svg>
                  </div>
                  <div className="flex aspect-square items-center justify-center rounded-full bg-pink-100 text-pink-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 8h12l-1 12H7L6 8z" />
                      <path d="M9 8a3 3 0 0 1 6 0" />
                    </svg>
                  </div>
                </div>

                {/* Local Store card */}
                <div className="mx-3 mt-4 rounded-lg border border-gray-100 bg-gray-50 p-2 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-green-100 text-green-600">
                      <FiHome size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-[11px] font-semibold text-gray-900">Local Store</p>
                        <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-blue-500">
                          <FiCheck size={8} className="text-white" />
                        </span>
                        <span className="text-[8px] text-blue-500 font-medium">Verified</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500">
                        <FiStar size={8} className="fill-amber-400 text-amber-400" />
                        <span>4.8 (230)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500">
                        <FiMapPin size={8} className="text-gray-400" />
                        <span>2.5 km away</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom: shopping bag + basket */}
                <div className="absolute bottom-3 left-0 right-0 flex items-end justify-between px-3">
                  {/* Produce basket */}
                  <div className="relative">
                    <div className="h-7 w-12 rounded-b-md bg-amber-700/90" />
                    <div className="absolute -top-1 left-1 right-1 flex gap-0.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    </div>
                  </div>
                  {/* Shopping bag with pin */}
                  <div className="relative">
                    <div className="relative h-12 w-10 rounded-b-md bg-blue-500">
                      <div className="absolute -top-1.5 left-1/2 h-2.5 w-5 -translate-x-1/2 rounded-t-full border-2 border-blue-500 border-b-0 bg-transparent" />
                    </div>
                    <div className="absolute -right-2 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                      <FiMapPin size={11} />
                    </div>
                  </div>
                </div>

                {/* Page indicator dots */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                </div>
              </div>
            </div>

            {/* Floating Card: Fast Delivery */}
            <div className="absolute left-10 top-16 flex items-center gap-2 rounded-lg bg-white px-1 py-2 shadow-lg ring-1 ring-black/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <FiTruck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Fast Delivery</p>
                <p className="text-[10px] text-gray-500">On Time</p>
              </div>
            </div>

            {/* Floating Card: Secure Payment */}
            <div className="absolute left-4 bottom-24 flex items-center gap-2 rounded-lg bg-white px-1 py-2 shadow-lg ring-1 ring-black/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <FiLock size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                <p className="text-[10px] text-gray-500">100% Safe</p>
              </div>
            </div>

            {/* Floating Card: 24/7 Support */}
            <div className="absolute right-20 bottom-[30%] flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg ring-1 ring-black/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <FiHeadphones size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">24/7 Support</p>
                <p className="text-[10px] text-gray-500">We&apos;re Here</p>
              </div>
            </div>

            {/* Tiny accent dots */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="absolute right-20 top-2 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Shop by Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shop by Categories</h2>
          <Link to="/categories" className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline whitespace-nowrap">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {(categories.length > 0
            ? categories.slice(0, 8)
            : Array.from({ length: 8 })
          ).map((c, idx) => {
            const placeholderNames = [
              'Automotive', 'Electronics', 'Fashion', 'Home & Garden',
              'Health & Beauty', 'Sports & Outdoors', 'Books', 'Toys & Games',
            ]
            const placeholderCounts = [
              '1,245+', '3,210+', '4,560+', '3,120+',
              '2,890+', '1,870+', '2,340+', '1,450+',
            ]
            const name = c?.name || placeholderNames[idx]
            const style = getHomeCategoryStyle(name, idx)
            const Icon = style.Icon
            const productLabel = c
              ? `${placeholderCounts[idx] || '120+'} Products`
              : `${placeholderCounts[idx]} Products`
            const target = c?._id ? `/categories?cat=${c._id}` : '/categories'
            return (
              <Link
                key={c?._id || `placeholder-${idx}`}
                to={target}
                className="group flex flex-col items-center text-center p-4 border border-gray-200 rounded-xl bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${style.bg} ${style.text} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon size={26} />
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{name}</p>
                <p className="mt-1 text-[11px] text-gray-500">{productLabel}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Trust Features (4 cards with circular icon backgrounds) */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiMapPin size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Local Vendors Near You</p>
              <p className="text-xs text-gray-500">Find trusted local vendors<br />in your area</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiLock size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Secure Payments</p>
              <p className="text-xs text-gray-500">100% secure payment<br />guaranteed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiTruck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Fast &amp; Reliable Delivery</p>
              <p className="text-xs text-gray-500">Quick delivery to<br />your doorstep</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiHeadphones size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">24/7 Customer Support</p>
              <p className="text-xs text-gray-500">We&apos;re always here<br />to help you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/deals" className="text-blue-600 font-semibold text-xs sm:text-sm whitespace-nowrap">View All →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <ModernLoader size={56} label="Loading products…" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {products.slice(0, 6).map((p) => (
              <Link key={p._id} to={`/product/${p._id}`} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow block">
                {p.images?.[0] ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-32 sm:h-40 object-cover" />
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center text-xs">No image</div>
                )}
                <div className="p-2 sm:p-3">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{p.name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-600 truncate">{p.category?.name || 'Product'}</p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
                    {p.discountPrice ? (
                      <>
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">Rs. {p.discountPrice}</span>
                        <span className="text-[10px] sm:text-xs text-gray-500 line-through">Rs. {p.price}</span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">Rs. {p.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-gray-600">
                    <span>⭐</span>
                    <span>4.5 (120)</span>
                  </div>
                  {user?.role !== 'vendor' && user?.role !== 'admin' && (
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stockQuantity < 1}
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-semibold py-1.5 rounded disabled:opacity-50"
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
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <FiMessageCircle size={36} className="flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Need Help? Ask Our AI Assistant</h3>
              <p className="text-xs sm:text-sm text-gray-300">Get instant answers to your questions.</p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-5 sm:px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 text-sm whitespace-nowrap">
            Chat Now →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-6">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Brand size={28} titleSizeClass="text-sm" taglineSizeClass="text-xs" showTagline={false} dark />
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
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <p className="font-semibold text-sm mb-2">Newsletter</p>
            <p className="text-xs text-gray-400 mb-2">Subscribe for updates</p>
            <div className="flex">
              <input type="email" placeholder="Email" className="flex-1 min-w-0 px-2 py-1.5 bg-gray-800 text-white text-xs rounded-l" />
              <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold rounded-r whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
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
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`w-full max-w-md bg-white max-h-[90vh] shadow-2xl overflow-y-auto rounded-lg scrollbar-hide transform transition-all duration-300 ease-out ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`} style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
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
