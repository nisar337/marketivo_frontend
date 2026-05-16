import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-gray-700'

const roleConfig = {
  vendor: {
    title: 'Vendor Login',
    description: 'Sign in to your vendor dashboard',
    backTo: 'Back to home',
    showRoleBadge: true,
  },
  admin: {
    title: 'Admin Login',
    description: 'Sign in to admin dashboard',
    backTo: 'Back to home',
    showRoleBadge: true,
  },
  customer: {
    title: 'Welcome back',
    description: 'Sign in to your Marketivo account',
    backTo: '← Back to home',
    showRoleBadge: false,
  },
}

export default function LoginPage({ role: roleProp }) {
  const { login, user, setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const effectiveRole = roleProp ||
    (location.pathname === '/login/vendor' ? 'vendor' : null) ||
    (location.pathname === '/login/admin' ? 'admin' : null)

  const config = roleConfig[effectiveRole] || roleConfig.customer

  useEffect(() => {
    if (user) {
      if (effectiveRole === 'admin' && user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (effectiveRole === 'vendor' && user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true })
      } else if (effectiveRole === 'admin' && user.role !== 'admin') {
        navigate('/', { replace: true })
      } else if (effectiveRole === 'vendor' && user.role !== 'vendor') {
        navigate('/', { replace: true })
      }
    }
  }, [user, effectiveRole, navigate])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      let endpoint = '/api/auth/login'
      let loginData = { email: form.email, password: form.password }

      if (effectiveRole === 'admin') {
        endpoint = '/api/auth/admin/login'
      } else if (effectiveRole === 'vendor') {
        endpoint = '/api/auth/login'
        loginData = { ...loginData, role: 'vendor' }
      }

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, loginData)

      if (effectiveRole === 'admin') {
        setAuth(data.token, data.user)
        if (data.user.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          setError('Access denied. This portal is for admins only.')
          setSubmitting(false)
          return
        }
      } else if (effectiveRole === 'vendor') {
        if (data.user.role === 'vendor') {
          setAuth(data.token, data.user)
          navigate('/vendor/dashboard', { replace: true })
        } else {
          setError('Access denied. This portal is for vendors only.')
          setSubmitting(false)
          return
        }
      } else {
        await login(form.email, form.password)
        navigate(location.state?.from || '/', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingLayout activeNav="none">
      <div className="bg-gradient-to-b from-sky-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-10">
            {config.showRoleBadge && (
              <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {effectiveRole === 'admin' ? '🔐 Admin Portal' : '🏪 Vendor Portal'}
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="mt-2 text-sm text-gray-600">{config.description}</p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>
                  {effectiveRole === 'admin' ? 'Admin Username or Email' : 'Email'}
                </label>
                <input
                  id="email"
                  name="email"
                  type={effectiveRole === 'admin' ? 'text' : 'email'}
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={effectiveRole === 'admin' ? 'admin' : 'you@example.com'}
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
                    placeholder="Your password"
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
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {!effectiveRole && (
              <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                  Create one
                </Link>
              </p>
            )}

            <div className="mt-4 flex justify-between text-sm">
              {effectiveRole === 'vendor' && (
                <Link to="/login" className="text-gray-500 hover:text-gray-800">
                  Customer Login
                </Link>
              )}
              {effectiveRole === 'admin' && (
                <Link to="/login" className="text-gray-500 hover:text-gray-800">
                  Customer Login
                </Link>
              )}
              {!effectiveRole && (
                <Link to="/login/vendor" className="text-blue-600 hover:text-blue-700 font-medium">
                  Vendor Login →
                </Link>
              )}
            </div>

            <p className="mt-3 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-800">
                {config.backTo}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}