import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiPackage, FiMapPin, FiCalendar, FiChevronRight, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-900 ring-amber-200',
  Processing: 'bg-blue-100 text-blue-900 ring-blue-200',
  Shipped: 'bg-violet-100 text-violet-900 ring-violet-200',
  Delivered: 'bg-green-100 text-green-900 ring-green-200',
  Cancelled: 'bg-red-100 text-red-900 ring-red-200',
}

function formatRs(n) {
  return `Rs. ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export default function MyOrdersPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const justPlaced = location.state?.orderPlaced

  useEffect(() => {
    if (user?.role === 'vendor' || user?.role === 'admin') {
      navigate('/vendor/dashboard', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API}/api/orders/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setOrders(data.orders)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [token])

  return (
    <MarketingLayout activeNav="none">
      <div className="min-h-[60vh] bg-gradient-to-b from-sky-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <FiPackage size={24} />
                </span>
                My orders
              </h1>
              <p className="mt-2 text-gray-600">Track purchases and delivery status.</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
            >
              Continue shopping
              <FiChevronRight size={18} />
            </Link>
          </div>

          {justPlaced && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
              Order placed successfully. You can track it below.
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
                <FiShoppingBag size={32} />
              </div>
              <p className="text-lg font-semibold text-gray-900">No orders yet</p>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                When you buy something from local vendors, your orders will show up here.
              </p>
              <Link
                to="/"
                className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {orders.map((order) => (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <span className="font-mono font-semibold text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <FiCalendar className="text-gray-400 shrink-0" size={16} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${statusStyles[order.status] || 'bg-gray-100 text-gray-800 ring-gray-200'}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 px-5">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-4 py-4">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product?.name || ''}
                            className="h-14 w-14 rounded-xl object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-xs text-gray-400">
                            —
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                          <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900 tabular-nums">{formatRs(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                    <p className="flex items-start gap-2 text-sm text-gray-600">
                      <FiMapPin className="mt-0.5 shrink-0 text-green-600" size={18} />
                      <span>
                        {[order.shippingAddress?.street, order.shippingAddress?.city, order.shippingAddress?.state]
                          .filter(Boolean)
                          .join(', ')}
                        {order.shippingAddress?.country && (
                          <>
                            <br />
                            {order.shippingAddress.country}
                          </>
                        )}
                      </span>
                    </p>
                    <div className="text-right sm:pl-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{formatRs(order.totalPrice)}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-10 text-center">
            <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              ← Back to profile
            </Link>
          </p>
        </div>
      </div>
    </MarketingLayout>
  )
}
