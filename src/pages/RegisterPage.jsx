import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'
import { resolveAfterLogin } from '../utils/postLogin'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-gray-700'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    storeName: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (searchParams.get('vendor') === '1') {
      setForm((prev) => ({ ...prev, role: 'vendor' }))
    }
  }, [searchParams])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await register(form)
      navigate(resolveAfterLogin(data.user, null), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingLayout activeNav="none">
      <div className="bg-gradient-to-b from-sky-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-10">
            <div className="mb-2 inline-flex items-center justify-center rounded-xl bg-green-100 p-3 text-green-700">
              <FiShoppingBag size={28} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-600">
              {form.role === 'vendor'
                ? 'Set up your vendor profile and start selling to local customers.'
                : 'Join Marketivo to shop from vendors near you.'}
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputClass} pr-11`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className={labelClass}>
                  I want to
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="customer">Shop as a customer</option>
                  <option value="vendor">Sell as a vendor</option>
                </select>
              </div>

              {form.role === 'vendor' && (
                <div className="space-y-4 rounded-xl border border-green-100 bg-green-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Vendor details</p>
                  <div>
                    <label htmlFor="storeName" className={labelClass}>
                      Store name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="storeName"
                      name="storeName"
                      type="text"
                      required
                      value={form.storeName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. Fresh Corner Lahore"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Store description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Tell shoppers what you sell (optional)"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Sign in
              </Link>
            </p>
            <p className="mt-3 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
