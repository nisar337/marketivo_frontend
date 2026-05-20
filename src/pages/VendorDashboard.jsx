import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import {
  FiBarChart2,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiUser,
  FiEdit,
  FiChevronDown,
  FiTrash2,
  FiMapPin,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiMenu,
} from 'react-icons/fi'
import { MdStorefront } from 'react-icons/md'
import LogoutConfirmation from '../components/LogoutConfirmation'
import DeleteConfirmation from '../components/DeleteConfirmation'
import ModernLoader from '../components/ModernLoader'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function VendorDashboard() {
  const { token, user, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [vendorOrders, setVendorOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileMenuHover, setProfileMenuHover] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [vendorReviews, setVendorReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewToDelete, setReviewToDelete] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', discountPrice: '', stockQuantity: '', inStock: 'true', brand: '', category: '', description: '', images: []
  })
  const [addProductError, setAddProductError] = useState('')
  const [addProductSubmitting, setAddProductSubmitting] = useState(false)
  const [vendorForm, setVendorForm] = useState({
    storeName: '',
    description: '',
    phone: '',
    website: '',
    businessAddress: ''
  })
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [locationUpdateSuccess, setLocationUpdateSuccess] = useState(false)
  const profileMenuRef = useRef(null)
  const showProfileMenu = profileMenuOpen || profileMenuHover
  const [showSidebar, setShowSidebar] = useState(false)
  const [reportRange, setReportRange] = useState('30d')
  const [reportStatus, setReportStatus] = useState('all')
  const [reportStartDate, setReportStartDate] = useState('')
  const [reportEndDate, setReportEndDate] = useState('')

  // Helper to navigate + auto-close mobile sidebar
  const goToView = (view) => {
    setActiveView(view)
    setShowSidebar(false)
  }

  const viewTitles = {
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    messages: 'Messages',
    reviews: 'Reviews',
    reports: 'Reports',
    settings: 'Settings',
    'add-product': 'Add Product',
  }

  useEffect(() => {
    const onDocClick = (e) => {
      if (!profileMenuRef.current?.contains(e.target)) {
        setProfileMenuOpen(false)
        setProfileMenuHover(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/api/products/vendor`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/orders/vendor`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setProducts(productsRes.data.products)
      setVendorOrders(ordersRes.data.orders)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchReviews = useCallback(async () => {
    if (!token) return
    setReviewsLoading(true)
    setReviewsError('')
    try {
      const { data } = await axios.get(`${API}/api/reviews/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVendorReviews(data.reviews || [])
    } catch (err) {
      setReviewsError(err.response?.data?.message || 'Failed to load reviews.')
    } finally {
      setReviewsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    axios.get(`${API}/api/categories`).then(({ data }) => setCategories(data.categories || [])).catch(() => {})
  }, [])

  // Initialize vendor form from user data
  useEffect(() => {
    if (user?.vendor) {
      setVendorForm({
        storeName: user.vendor.storeName || '',
        description: user.vendor.description || '',
        phone: user.vendor.phone || '',
        website: user.vendor.website || '',
        businessAddress: user.vendor.businessAddress || ''
      })
    }
  }, [user?.vendor])

  const totalSales = vendorOrders.reduce((sum, order) => sum + (order.itemTotal || 0), 0)
  const totalOrders = vendorOrders.length
  const totalProducts = products.length
  const totalCustomers = new Set(vendorOrders.map(o => o.customer?._id)).size

  const DAY_MS = 24 * 60 * 60 * 1000
  const reportRangeStart = (() => {
    if (reportRange === 'custom') {
      return reportStartDate ? new Date(`${reportStartDate}T00:00:00`) : null
    }
    if (reportRange === 'all') return null
    const days = reportRange === '7d' ? 7 : reportRange === '90d' ? 90 : 30
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    start.setHours(0, 0, 0, 0)
    return start
  })()
  const reportRangeEnd = (() => {
    if (reportRange === 'custom') {
      return reportEndDate ? new Date(`${reportEndDate}T23:59:59`) : null
    }
    return new Date()
  })()

  const reportOrders = vendorOrders.filter((order) => {
    const status = order.status || 'Pending'
    if (reportStatus !== 'all' && status !== reportStatus) return false
    if (!reportRangeStart && !reportRangeEnd) return true
    if (!order.createdAt) return false
    const orderDate = new Date(order.createdAt)
    if (reportRangeStart && orderDate < reportRangeStart) return false
    if (reportRangeEnd && orderDate > reportRangeEnd) return false
    return true
  })

  const reportSales = reportOrders.reduce((sum, order) => sum + (order.itemTotal || 0), 0)
  const reportOrderCount = reportOrders.length
  const reportItemCount = reportOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
  const reportAverageOrder = reportOrderCount ? reportSales / reportOrderCount : 0
  const reportCustomers = new Set(reportOrders.map(o => o.customer?._id).filter(Boolean)).size

  const topReportProducts = Object.values(
    reportOrders.reduce((acc, order) => {
      order.items?.forEach((item) => {
        const name = item.product?.name || 'Unnamed Product'
        if (!acc[name]) {
          acc[name] = { name, quantity: 0, revenue: 0 }
        }
        acc[name].quantity += item.quantity || 1
        acc[name].revenue += (item.totalPrice || item.price || 0) * (item.quantity || 1)
      })
      return acc
    }, {})
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const reportChartSeries = (() => {
    const end = reportRangeEnd || new Date()
    const start = reportRangeStart || new Date(end.getTime() - 6 * DAY_MS)
    const totalDays = Math.max(1, Math.floor((end - start) / DAY_MS) + 1)
    const bucketCount = Math.min(14, totalDays)
    const bucketSize = Math.ceil(totalDays / bucketCount)
    const buckets = Array.from({ length: bucketCount }, (_, idx) => {
      const bucketStart = new Date(start.getTime() + idx * bucketSize * DAY_MS)
      const bucketEnd = new Date(Math.min(end.getTime(), bucketStart.getTime() + (bucketSize * DAY_MS) - 1))
      return { start: bucketStart, end: bucketEnd, value: 0 }
    })

    reportOrders.forEach((order) => {
      if (!order.createdAt) return
      const orderDate = new Date(order.createdAt)
      if (orderDate < start || orderDate > end) return
      const offset = Math.floor((orderDate - start) / DAY_MS)
      const bucketIndex = Math.min(bucketCount - 1, Math.floor(offset / bucketSize))
      buckets[bucketIndex].value += order.itemTotal || 0
    })

    return buckets.map((bucket) => {
      const label = bucketSize === 1
        ? bucket.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : `${bucket.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}-${bucket.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      return { label, value: bucket.value }
    })
  })()
  const reportChartMax = Math.max(1, ...reportChartSeries.map((point) => point.value))

  const reportRangeLabel = reportRange === 'custom'
    ? (reportStartDate && reportEndDate ? `${reportStartDate} → ${reportEndDate}` : 'Custom range')
    : reportRange === '7d'
      ? 'Last 7 days'
      : reportRange === '90d'
        ? 'Last 90 days'
        : reportRange === 'all'
          ? 'All time'
          : 'Last 30 days'

  const getOrderStatusColor = (status) => {
    if (status === 'Processing') return 'bg-blue-100 text-blue-700'
    if (status === 'Shipped') return 'bg-yellow-100 text-yellow-700'
    if (status === 'Delivered') return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrder(orderId)
    try {
      await axios.put(
        `${API}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setVendorOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error('Failed to update order status:', err)
      alert('Failed to update order status')
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    try {
      await axios.delete(`${API}/api/orders/${orderToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVendorOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id))
      setOrderToDelete(null)
    } catch (err) {
      console.error('Failed to delete order:', err)
      alert('Failed to delete order')
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      await axios.delete(`${API}/api/products/${productToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id))
      setProductToDelete(null)
    } catch (err) {
      console.error('Failed to delete product:', err)
      alert('Failed to delete product')
    }
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return
    try {
      await axios.delete(`${API}/api/reviews/${reviewToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setVendorReviews((prev) => prev.filter((review) => review._id !== reviewToDelete._id))
      setReviewToDelete(null)
    } catch (err) {
      console.error('Failed to delete review:', err)
      alert(err.response?.data?.message || 'Failed to delete review')
    }
  }

  const handleNewProductChange = (e) => {
    const { name, value } = e.target
    setNewProduct((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      setAddProductError('Maximum 5 images allowed')
      return
    }
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setAddProductError('Each image must be less than 5MB')
        return false
      }
      return true
    })
    setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...validFiles].slice(0, 5) }))
    e.target.value = ''
  }

  const removeImage = (idx) => {
    setNewProduct((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setAddProductError('')

    if (!newProduct.name.trim()) {
      setAddProductError('Product title is required')
      return
    }
    if (!newProduct.price || Number(newProduct.price) <= 0) {
      setAddProductError('Valid price is required')
      return
    }
    if (!newProduct.stockQuantity || Number(newProduct.stockQuantity) < 0) {
      setAddProductError('Valid quantity is required')
      return
    }
    if (!newProduct.category) {
      setAddProductError('Category is required')
      return
    }

    setAddProductSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', newProduct.name.trim())
      formData.append('price', String(Number(newProduct.price)))
      if (newProduct.discountPrice) {
        formData.append('discountPrice', String(Number(newProduct.discountPrice)))
      }
      formData.append('stockQuantity', String(Number(newProduct.stockQuantity)))
      formData.append('inStock', newProduct.inStock)
      if (newProduct.brand.trim()) {
        formData.append('brand', newProduct.brand.trim())
      }
      formData.append('category', newProduct.category)
      if (newProduct.description.trim()) {
        formData.append('description', newProduct.description.trim())
      }
      newProduct.images.forEach((img) => {
        formData.append('images', img)
      })

      const res = await axios.post(`${API}/api/products`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setProducts((prev) => [res.data.product, ...prev])
      setNewProduct({ name: '', price: '', discountPrice: '', stockQuantity: '', inStock: 'true', brand: '', category: '', description: '', images: [] })
      setActiveView('products')
    } catch (err) {
      console.error('Failed to add product:', err)
      setAddProductError(err.response?.data?.message || 'Failed to add product')
    } finally {
      setAddProductSubmitting(false)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    if (!editingProduct) return
    try {
      const formData = new FormData()
      formData.append('name', editingProduct.name)
      formData.append('description', editingProduct.description || '')
      formData.append('price', String(Number(editingProduct.price) || 0))
      formData.append('discountPrice', editingProduct.discountPrice ? String(Number(editingProduct.discountPrice)) : '')
      formData.append('stockQuantity', String(Number(editingProduct.stockQuantity) || 0))
      const categoryId = typeof editingProduct.category === 'object'
        ? editingProduct.category?._id
        : editingProduct.category
      if (categoryId) {
        formData.append('category', categoryId)
      }

      const res = await axios.put(`${API}/api/products/${editingProduct._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data.product : p)))
      setEditingProduct(null)
    } catch (err) {
      console.error('Failed to update product:', err)
      alert(err.response?.data?.message || 'Failed to update product')
    }
  }

  const profileImage =
    user?.vendor?.logo?.trim?.() ? user.vendor.logo : null

  return (
    <div className="w-full bg-white overflow-x-hidden">
      <div className="flex h-screen relative">
        {/* Mobile sidebar backdrop */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${
            showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">
              <MdStorefront size={24} />
            </div>
            <span className="text-xl font-bold">Marketivo</span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => goToView('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiBarChart2 size={18} /> Dashboard
            </button>
            <button
              onClick={() => goToView('products')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiPackage size={18} /> Products
            </button>
            <button
              onClick={() => goToView('orders')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiShoppingCart size={18} /> Orders
            </button>
           
        
            <button
              onClick={() => goToView('reviews')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'reviews'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiStar size={18} /> Reviews
            </button>
            <button
              onClick={() => goToView('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiTrendingUp size={18} /> Reports
            </button>
            <button
              onClick={() => goToView('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                activeView === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FiSettings size={18} /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 text-slate-300 hover:bg-red-900/20 hover:text-red-300"
            >
              <FiLogOut size={18} /> Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {user?.role === 'vendor' && user?.vendor?.status === 'pending' && (
            <div className="flex-shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3">
              <p>
                <span className="font-semibold">Shop pending approval.</span> Your storefront is not visible to customers
                until an administrator approves your shop. You can still update your profile here.
              </p>
              <button
                type="button"
                onClick={() => refreshProfile()}
                className="shrink-0 rounded-lg bg-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-300"
              >
                Refresh status
              </button>
            </div>
          )}
          <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                aria-label="Open menu"
              >
                <FiMenu size={20} />
              </button>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{viewTitles[activeView] || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="relative"
                ref={profileMenuRef}
                onMouseEnter={() => setProfileMenuHover(true)}
                onMouseLeave={() => setProfileMenuHover(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileMenuOpen((v) => !v)
                  }}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="true"
                  title="Profile menu"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <FiUser size={20} />
                  )}
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 top-full z-50 w-52 pt-1">
                  <div className="rounded-xl border border-gray-100 bg-white py-2 shadow-xl animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="truncate text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        setProfileMenuHover(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <FiUser size={16} />
                      View profile
                    </Link>
                    <Link
                      to="/profile?edit=true"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        setProfileMenuHover(false)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      <FiEdit size={16} />
                      Edit profile
                    </Link>
                  </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveView('add-product')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <FiPlus size={16} /> Add Product
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4">
            {activeView === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-xs font-medium mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">Rs. {totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <span>📈</span>
                    <span className="font-semibold">12.9%</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-xs font-medium mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{totalOrders}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <span>📈</span>
                    <span className="font-semibold">8.3%</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-xs font-medium mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{totalProducts}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <span>📈</span>
                    <span className="font-semibold">15.2%</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-600 text-xs font-medium mb-1">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{totalCustomers.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <span>📈</span>
                    <span className="font-semibold">10.2%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Sales Overview</h2>
                  <div className="h-40 flex items-end justify-between gap-1">
                    {[10, 20, 15, 30, 25, 35, 40].map((height, i) => (
                      <div key={i} className="flex-1 bg-blue-600 rounded-t" style={{ height: `${height * 1.2}px` }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1 May</span>
                    <span>6 May</span>
                    <span>11 May</span>
                    <span>16 May</span>
                    <span>21 May</span>
                    <span>26 May</span>
                    <span>31 May</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Recent Orders</h2>
                  <div className="space-y-2">
                    {vendorOrders.slice(0, 4).map((order) => (
                      <div key={order._id} className="pb-2 border-b border-gray-200 last:border-b-0">
                        <p className="font-semibold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-600">{order.customer?.name || 'Customer'}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-semibold text-gray-900">Rs. {order.itemTotal?.toFixed(2) || '0.00'}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getOrderStatusColor(order.status)}`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )}

          {activeView === 'products' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-6">
                  <ModernLoader size={48} />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">No products yet. Click "Add Product" to create your first listing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No image</div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="p-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">Stock: {product.stockQuantity}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {product.discountPrice ? (
                            <>
                              <span className="text-sm font-bold text-blue-600">Rs. {product.discountPrice}</span>
                              <span className="text-xs text-gray-500 line-through">Rs. {product.price}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">Rs. {product.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'orders' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Orders</h2>
              {vendorOrders.length === 0 ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-600">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiShoppingCart className="text-blue-600" size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-gray-600">{order.customer?.name || 'Customer'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getOrderStatusColor(order.status)}`}>
                              {order.status || 'Pending'}
                            </span>
                            <FiChevronRight size={18} className={`text-gray-400 transition-transform ${expandedOrder === order._id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">{order.items?.length || 0} items</p>
                          <p className="font-bold text-gray-900">Rs. {order.itemTotal?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>

                      {expandedOrder === order._id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                <FiUser size={16} /> Customer Information
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                  <FiMail size={12} /> {order.customer?.email || 'N/A'}
                                </p>
                              </div>

                              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                <FiMapPin size={16} /> Delivery Address
                              </h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200">
                                {order.shippingAddress ? (
                                  <>
                                    <p className="text-sm text-gray-700">{order.shippingAddress.name || order.customer?.name}</p>
                                    {order.shippingAddress.phone && (
                                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                        <FiPhone size={12} /> {order.shippingAddress.phone}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1">
                                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                    </p>
                                    <p className="text-xs text-gray-600">{order.shippingAddress.country}</p>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">No address provided</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm">Order Items</h4>
                              <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    {item.product?.images?.[0]?.url ? (
                                      <img src={item.product.images[0].url} alt={item.product.name} className="w-10 h-10 object-cover rounded" />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity} x Rs. {item.price}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-blue-600">Rs. {order.itemTotal?.toFixed(2) || '0.00'}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={order.status || 'Pending'}
                                  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                  disabled={updatingOrder === order._id}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => setOrderToDelete(order)}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-3">Order placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'add-product' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    name="name"
                    value={newProduct.name}
                    onChange={handleNewProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter product title"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) *</label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleNewProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
                    <input
                      type="number"
                      name="discountPrice"
                      value={newProduct.discountPrice}
                      onChange={handleNewProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="Optional"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={newProduct.stockQuantity}
                      onChange={handleNewProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status *</label>
                    <select
                      name="inStock"
                      value={newProduct.inStock}
                      onChange={handleNewProductChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    value={newProduct.brand}
                    onChange={handleNewProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Enter brand name (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={handleNewProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newProduct.description}
                    onChange={handleNewProductChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    rows={3}
                    placeholder="Enter product description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Photos (up to 5)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="product-images"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="product-images" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <FiPlus className="text-3xl text-gray-400" />
                        <span className="text-sm text-gray-600">Click to upload images</span>
                        <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB each</span>
                      </div>
                    </label>
                    {newProduct.images.length > 0 && (
                      <div className="flex gap-2 mt-4 flex-wrap justify-center">
                        {newProduct.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {addProductError && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {addProductError}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setNewProduct({ name: '', price: '', discountPrice: '', stockQuantity: '', inStock: 'true', brand: '', category: '', description: '', images: [] })
                      setAddProductError('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={addProductSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center gap-2"
                  >
                    {addProductSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Adding...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeView === 'customers' && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Customers</h2>
              <p className="text-sm text-gray-600 text-center py-6">Customer management coming soon</p>
            </div>
          )}

          {activeView === 'messages' && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
              <p className="text-sm text-gray-600 text-center py-6">Messages coming soon</p>
            </div>
          )}

          {activeView === 'reviews' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
                    <p className="text-xs text-gray-500">See what customers say about your products.</p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchReviews}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                {reviewsLoading ? (
                  <div className="py-6 flex justify-center">
                    <ModernLoader />
                  </div>
                ) : reviewsError ? (
                  <div className="py-6 text-center text-sm text-red-600">{reviewsError}</div>
                ) : vendorReviews.length ? (
                  <div className="space-y-4">
                    {vendorReviews.map((review) => (
                      <div key={review._id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            {review.product?.images?.[0]?.url ? (
                              <img
                                src={review.product.images[0].url}
                                alt={review.product?.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-100 text-xs text-gray-400 flex items-center justify-center">
                                No image
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{review.product?.name || 'Product'}</p>
                              <p className="text-xs text-gray-500">by {review.user?.name || 'Customer'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-yellow-400">
                              {[...Array(5)].map((_, index) => (
                                <FiStar
                                  key={index}
                                  size={14}
                                  className={index < (review.rating || 0) ? 'fill-current' : ''}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setReviewToDelete(review)}
                              className="text-xs text-red-600 font-semibold hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">No reviews yet.</div>
                )}
              </div>
            </div>
          )}

          {activeView === 'reports' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Reports</h2>
                    <p className="text-xs text-gray-500">Range: {reportRangeLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={reportRange}
                      onChange={(e) => setReportRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="all">All time</option>
                      <option value="custom">Custom range</option>
                    </select>
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    {reportRange === 'custom' && (
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="date"
                          value={reportStartDate}
                          onChange={(e) => setReportStartDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="date"
                          value={reportEndDate}
                          onChange={(e) => setReportEndDate(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Total Sales</p>
                  <p className="text-xl font-bold text-gray-900">Rs. {reportSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-xl font-bold text-gray-900">{reportOrderCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Items Sold</p>
                  <p className="text-xl font-bold text-gray-900">{reportItemCount}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">Avg. Order Value</p>
                  <p className="text-xl font-bold text-gray-900">Rs. {reportAverageOrder.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-white p-4 rounded-lg border border-gray-200 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Sales Trend</h3>
                    <span className="text-xs text-gray-500">{reportOrders.length} orders</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {reportChartSeries.map((point) => (
                      <div key={point.label} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-blue-100 rounded-md flex items-end"
                          style={{ height: '100%' }}
                        >
                          <div
                            className="w-full bg-blue-600 rounded-md"
                            style={{ height: `${(point.value / reportChartMax) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 text-center leading-tight">{point.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
                    <span className="text-xs text-gray-500">{reportCustomers} customers</span>
                  </div>
                  {topReportProducts.length ? (
                    <div className="space-y-3">
                      {topReportProducts.map((product) => (
                        <div key={product.name} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} sold</p>
                          </div>
                          <p className="text-sm font-semibold text-blue-600">Rs. {product.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No products in this range.</p>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Orders in Report</h3>
                  <span className="text-xs text-gray-500">{reportOrderCount} orders • Rs. {reportSales.toFixed(2)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase text-gray-500 border-b border-gray-200">
                        <th className="py-2 pr-4">Order</th>
                        <th className="py-2 pr-4">Customer</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Items</th>
                        <th className="py-2 pr-4">Total</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportOrders.length ? (
                        reportOrders.map((order) => (
                          <tr key={order._id} className="border-b border-gray-100 last:border-b-0">
                            <td className="py-3 pr-4 font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 pr-4 text-gray-700">{order.customer?.name || 'Customer'}</td>
                            <td className="py-3 pr-4">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getOrderStatusColor(order.status || 'Pending')}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-gray-700">{order.items?.length || 0}</td>
                            <td className="py-3 pr-4 font-semibold text-gray-900">Rs. {(order.itemTotal || 0).toFixed(2)}</td>
                            <td className="py-3 text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-6 text-center text-sm text-gray-500">No orders found for this range.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal with Animations */}
          {showLocationModal && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out"
              style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
              {/* Backdrop with blur */}
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => {
                  setShowLocationModal(false)
                  setLocationUpdateSuccess(false)
                }}
              />
              
              {/* Modal Content with scale animation */}
              <div 
                className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all duration-300 ease-out"
                style={{ 
                  animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
              >
                {/* Animated Success Icon */}
                <div 
                  className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' }}
                >
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ animation: 'checkmark 0.4s ease-out 0.3s both' }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>

                {/* Title with fade animation */}
                <h3 
                  className="text-2xl font-bold text-gray-900 mb-3"
                  style={{ animation: 'fadeInUp 0.4s ease-out 0.2s both' }}
                >
                  {locationUpdateSuccess ? '📍 Location Updated!' : 'Settings Saved!'}
                </h3>

                {/* Description with fade animation */}
                <p 
                  className="text-gray-600 mb-8 leading-relaxed"
                  style={{ animation: 'fadeInUp 0.4s ease-out 0.3s both' }}
                >
                  {locationUpdateSuccess }
                   
                </p>

                {/* Button with hover animation */}
                <button
                  onClick={() => {
                    setShowLocationModal(false)
                    setLocationUpdateSuccess(false)
                  }}
                  className="w-48 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200"
                  style={{ animation: 'fadeInUp 0.4s ease-out 0.4s both' }}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shop Settings</h2>
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await axios.patch(`${API}/api/vendors/me`, vendorForm, {
                    headers: { Authorization: `Bearer ${token}` }
                  })
                  // Check if location was updated
                  const isLocationUpdate = vendorForm.businessAddress !== user?.vendor?.businessAddress
                  setLocationUpdateSuccess(isLocationUpdate)
                  setShowLocationModal(true)
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to save settings')
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    value={vendorForm.storeName}
                    onChange={(e) => setVendorForm({ ...vendorForm, storeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={vendorForm.description}
                    onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="text"
                      value={vendorForm.website}
                      onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FiMapPin className="inline mr-1" /> Shop Location
                  </label>
                  <input
                    type="text"
                    value={vendorForm.businessAddress}
                    onChange={(e) => setVendorForm({ ...vendorForm, businessAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="e.g., 123 Main Street, Lahore, Pakistan"
                  />
                  <p className="text-xs text-gray-500 mt-1">This location will be displayed on your shop profile and in search results.</p>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </form>
            </div>
          )}
        </div>
        </main>
      </div>

      <LogoutConfirmation
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <DeleteConfirmation
        isOpen={!!orderToDelete}
        title="Delete Order"
        message={`Are you sure you want to delete order #${orderToDelete?._id?.slice(-6).toUpperCase()}? This action cannot be undone.`}
        onConfirm={handleDeleteOrder}
        onCancel={() => setOrderToDelete(null)}
      />

      <DeleteConfirmation
        isOpen={!!productToDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />

      <DeleteConfirmation
        isOpen={!!reviewToDelete}
        title="Delete Review"
        message={`Delete this review from ${reviewToDelete?.user?.name || 'customer'}? This action cannot be undone.`}
        onConfirm={handleDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Product</h2>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Rs.)</label>
                    <input
                      type="number"
                      value={editingProduct.discountPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
