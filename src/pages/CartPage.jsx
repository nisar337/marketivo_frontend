import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { FiArrowLeft, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

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

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'vendor' || user?.role === 'admin') {
      navigate('/vendor/dashboard', { replace: true })
    }
  }, [user, navigate])

  const formatRs = (n) => `Rs. ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Brand />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            <FiArrowLeft size={18} />
            Continue shopping
          </Link>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center gap-3 text-blue-600">
            <FiShoppingCart size={28} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Shopping cart</h1>
          </div>
          <p className="mt-2 text-gray-600">Review your items and proceed when you&apos;re ready.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FiShoppingCart size={32} />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-gray-500">Add products from the home page to see them here.</p>
            <Link
              to="/"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-full rounded-lg object-cover sm:h-24 sm:w-24 sm:flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500 sm:h-24 sm:w-24">
                      No image
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-green-600">{formatRs(item.price)} each</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQuantity}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="min-w-[5.5rem] text-right text-base font-bold text-gray-900 sm:text-lg">
                      {formatRs(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                    >
                      <FiTrash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-gray-900">Order summary</h2>
              <div className="mt-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-600">Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                <span className="font-semibold text-gray-900">{formatRs(cartTotal)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatRs(cartTotal)}</span>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {user ? (
                  <Link
                    to="/checkout"
                    className="block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700"
                  >
                    Proceed to checkout
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700"
                  >
                    Sign in to checkout
                  </Link>
                )}
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full rounded-lg border border-red-200 bg-white py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-white pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center mb-8">
            <Brand size={32} titleSizeClass="text-xl" showTagline={false} />
            <p className="mt-4 max-w-xs text-center text-sm text-gray-500">
              The best choice for local vendors and conscious shoppers.
            </p>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Marketivo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
