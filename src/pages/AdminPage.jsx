import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { FiRefreshCw, FiUsers, FiShoppingBag, FiShield, FiLogOut, FiHome, FiEye, FiEyeOff, FiTrash2, FiShoppingCart } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import LogoutConfirmation from '../components/LogoutConfirmation'
import DeleteConfirmation from '../components/DeleteConfirmation'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const STATUSES = ['pending', 'approved', 'suspended']
const statusClass = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
}

import ModernLoader from '../components/ModernLoader'

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <ModernLoader size={64} label="Loading…" />
    </div>
  )
}

/** /admin — sign-in and panel stay on this URL (never redirects to /login). */
export default function AdminPage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    const prev = document.title
    document.title = 'Welcome to Marketivo Admin'
    return () => {
      document.title = prev
    }
  }, [])

  if (loading) return <Spinner />
  if (!user) return <AdminSignIn />
  if (user.role !== 'admin') return <AdminDenied />
  return <AdminPanel />
}

function AdminSignIn() {
  const { setAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await axios.post(`${API}/api/auth/admin/login`, {
        email: form.email,
        password: form.password,
      })
      setAuth(res.data.token, res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-white p-8 shadow-2xl">
        <p className="flex items-center gap-2 text-blue-600 text-sm font-semibold uppercase tracking-wide">
          <FiShield size={18} /> Marketivo Admin
        </p>
       

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              id="admin-email"
              name="email"
              type="text"
              required
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              placeholder="admin@example.com or username"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>

      
      </div>
    </div>
  )
}

function AdminDenied() {
  const { logout, user } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
        <FiShield className="mx-auto text-red-500" size={40} />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-gray-600">
          Signed in as <strong>{user?.email}</strong>, which is not an administrator account.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Sign out
          </button>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
            Go to store
          </Link>
        </div>
      </div>
    </div>
  )
}

function AdminPanel() {
  const { token, user, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [activeView, setActiveView] = useState('vendors')
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [vendorProducts, setVendorProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, productName: '' })
  const [deleteShopModal, setDeleteShopModal] = useState({ open: false, shopId: null, shopName: '' })
  const [vendorProfile, setVendorProfile] = useState(null)

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    logout()
  }

  const headers = { Authorization: `Bearer ${token}` }

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    setLoading(true)
    try {
      const [u, s, o] = await Promise.all([
        axios.get(`${API}/api/admin/users`, { headers }),
        axios.get(`${API}/api/admin/shops`, { headers }),
        axios.get(`${API}/api/admin/orders`, { headers }),
      ])
      setUsers(u.data.users || [])
      setShops(s.data.shops || [])
      setOrders(o.data.orders || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (shopId, status) => {
    setUpdatingId(shopId)
    setError('')
    try {
      await axios.patch(`${API}/api/admin/shops/${shopId}/status`, { status }, { headers })
      await load()
    } catch (e) {
      setError(e.response?.data?.message || 'Could not update shop status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteShop = async () => {
    if (!deleteShopModal.shopId) return
    setUpdatingId(deleteShopModal.shopId)
    setError('')
    try {
      await axios.delete(`${API}/api/admin/shops/${deleteShopModal.shopId}`, { headers })
      await load()
      setDeleteShopModal({ open: false, shopId: null, shopName: '' })
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete shop.')
    } finally {
      setUpdatingId(null)
    }
  }

  const openDeleteShopModal = (shop) => {
    setDeleteShopModal({ open: true, shopId: shop._id, shopName: shop.storeName })
  }

  const closeDeleteShopModal = () => {
    setDeleteShopModal({ open: false, shopId: null, shopName: '' })
  }

  const fetchVendorProducts = async (shop) => {
    setSelectedVendor(shop)
    setLoadingProducts(true)
    try {
      const res = await axios.get(`${API}/api/admin/shops/${shop._id}/products`, { headers })
      setVendorProducts(res.data.products || [])
    } catch (e) {
      setError('Failed to load vendor products.')
    } finally {
      setLoadingProducts(false)
    }
  }

  const deleteProduct = async () => {
    if (!deleteModal.productId) return
    setUpdatingId(deleteModal.productId)
    try {
      await axios.delete(`${API}/api/admin/products/${deleteModal.productId}`, { headers })
      setVendorProducts((prev) => prev.filter((p) => p._id !== deleteModal.productId))
      setDeleteModal({ open: false, productId: null, productName: '' })
    } catch (e) {
      setError(e.response?.data?.message || 'Could not delete product.')
    } finally {
      setUpdatingId(null)
    }
  }

  const openDeleteModal = (product) => {
    setDeleteModal({ open: true, productId: product._id, productName: product.name })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, productId: null, productName: '' })
  }

  const closeVendorModal = () => {
    setSelectedVendor(null)
    setVendorProducts([])
  }

  const openVendorProfile = (shop) => {
    setVendorProfile(shop)
  }

  const closeVendorProfile = () => {
    setVendorProfile(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-blue-600 text-sm font-semibold uppercase tracking-wide">
              <FiShield size={20} /> /admin
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Welcome to Marketivo Admin</h1>
           
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-gray-500 mr-2">{user?.email}</span>
           
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <FiLogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-10">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!vendorProfile && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('vendors')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeView === 'vendors'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiShoppingBag size={18} /> View Vendors
            </button>
            <button
              type="button"
              onClick={() => setActiveView('customers')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeView === 'customers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiUsers size={18} /> View Customers
            </button>
            <button
              type="button"
              onClick={() => setActiveView('orders')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeView === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiShoppingCart size={18} /> View Orders
            </button>
          </div>
        )}

        {activeView === 'vendors' && !selectedVendor && !vendorProfile && (
          <AdminTable
            title="Shops (vendors)"
            icon={FiShoppingBag}
            loading={loading && !shops.length}
            empty="No vendor shops yet."
            columns={['Store', 'Owner', 'Email', 'Phone', 'Status', 'Products', 'Actions']}
            rows={shops.map((shop) => {
              const owner = shop.userId
              return (
                <tr key={shop._id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => openVendorProfile(shop)}
                          className="relative focus:outline-none"
                        >
                          {shop.logo ? (
                            <img src={shop.logo} alt={shop.storeName} className="w-10 h-10 rounded-full object-cover" />
                          ) : owner?.avatarUrl ? (
                            <img src={owner.avatarUrl} alt={owner.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                              {shop.storeName?.charAt(0).toUpperCase() || 'S'}
                            </div>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                            View
                          </span>
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => fetchVendorProducts(shop)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {shop.storeName}
                        </button>
                        {shop.description && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">{shop.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {owner?.avatarUrl ? (
                        <img src={owner.avatarUrl} alt={owner.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {owner?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="text-gray-700">{owner?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{owner?.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{shop.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusClass[shop.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => fetchVendorProducts(shop)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View Products
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={updatingId === shop._id || shop.status === s}
                          onClick={() => updateStatus(shop._id, s)}
                          className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                            shop.status === s
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={updatingId === shop._id}
                        onClick={() => openDeleteShopModal(shop)}
                        className="rounded-md px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          />
        )}

        {activeView === 'customers' && (
          <AdminTable
            title="User accounts (customers)"
            icon={FiUsers}
            loading={loading && !users.length}
            empty="No customers found."
            columns={['Name', 'Email', 'Role', 'Joined']}
            rows={users
              .filter((u) => u.role === 'customer')
              .map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-gray-700">{u.role}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
          />
        )}

        {activeView === 'orders' && (
          <AdminTable
            title="Orders"
            icon={FiShoppingCart}
            loading={loading && !orders.length}
            empty="No orders found."
            columns={['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date']}
            rows={orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{order._id.slice(-8)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{order.customer?.name || '—'}</div>
                  <div className="text-xs text-gray-500">{order.customer?.email || '—'}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{order.orderItems?.length || 0} items</td>
                <td className="px-4 py-3 font-semibold text-gray-900">Rs. {order.totalPrice?.toFixed(2) || '0.00'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          />
        )}
      </main>

      {vendorProfile && !selectedVendor && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              type="button"
              onClick={closeVendorProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 transition-all duration-200 mb-4"
            >
              &larr; Back
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
              <div className="flex items-center gap-6">
                {vendorProfile.logo ? (
                  <img src={vendorProfile.logo} alt={vendorProfile.storeName} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : vendorProfile.userId?.avatarUrl ? (
                  <img src={vendorProfile.userId.avatarUrl} alt={vendorProfile.userId.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold">
                    {vendorProfile.storeName?.charAt(0).toUpperCase() || 'S'}
                  </div>
                )}
                <div className="text-white">
                  <h2 className="text-3xl font-bold">{vendorProfile.storeName}</h2>
                  <p className="text-blue-100 mt-1">Vendor Profile</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Owner Information</h3>
                  <div className="flex items-center gap-3">
                    {vendorProfile.userId?.avatarUrl ? (
                      <img src={vendorProfile.userId.avatarUrl} alt={vendorProfile.userId.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {vendorProfile.userId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{vendorProfile.userId?.name || '—'}</p>
                      <p className="text-sm text-gray-500">{vendorProfile.userId?.email || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                  <p><span className="text-gray-500">Phone:</span> <span className="ml-2 text-gray-900">{vendorProfile.phone || '—'}</span></p>
                  <p><span className="text-gray-500">Website:</span> <span className="ml-2 text-gray-900">{vendorProfile.website || '—'}</span></p>
                  <p><span className="text-gray-500">Address:</span> <span className="ml-2 text-gray-900">{vendorProfile.businessAddress || '—'}</span></p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Shop Status</h3>
                  <p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${vendorProfile.status === 'approved' ? 'bg-green-100 text-green-700' : vendorProfile.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {vendorProfile.status}
                    </span>
                  </p>
                  <p><span className="text-gray-500">Created:</span> <span className="ml-2 text-gray-900">{vendorProfile.createdAt ? new Date(vendorProfile.createdAt).toLocaleDateString() : '—'}</span></p>
                </div>
                {vendorProfile.description && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Description</h3>
                    <p className="text-gray-700">{vendorProfile.description}</p>
                  </div>
                )}
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => { closeVendorProfile(); fetchVendorProducts(vendorProfile); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  View Products
                </button>
                <button
                  type="button"
                  onClick={() => { openDeleteShopModal(vendorProfile); closeVendorProfile(); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 size={16} /> Delete Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedVendor && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              type="button"
              onClick={closeVendorModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 transition-all duration-200 mb-4"
            >
              &larr; Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.storeName}</h2>
            <p className="text-sm text-gray-500">Vendor Products</p>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-20">
              <ModernLoader size={64} label="Loading products…" />
            </div>
          ) : vendorProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No products found for this vendor.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {vendorProducts.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Rs. {product.price?.toLocaleString() || 0}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === product._id}
                        onClick={() => openDeleteModal(product)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                      >
                        <FiTrash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LogoutConfirmation
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <DeleteConfirmation
        isOpen={deleteModal.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
        onConfirm={deleteProduct}
        onCancel={closeDeleteModal}
      />

      <DeleteConfirmation
        isOpen={deleteShopModal.open}
        title="Delete Shop"
        message={`Are you sure you want to delete "${deleteShopModal.shopName}" and all its products? This action cannot be undone.`}
        onConfirm={deleteShop}
        onCancel={closeDeleteShopModal}
      />
    </div>
  )
}

function AdminTable({ title, icon: Icon, loading, empty, columns, rows }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <Icon className="text-blue-600" /> {title}
      </h2>
      {loading ? (
        <div className="flex justify-center py-12 rounded-xl border border-gray-200 bg-white">
          <ModernLoader size={56} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{rows}</tbody>
          </table>
          {!rows.length && <p className="px-4 py-8 text-center text-gray-500">{empty}</p>}
        </div>
      )}
    </section>
  )
}
