import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiKey } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import MarketingLayout from '../components/MarketingLayout'
import Toast from '../components/Toast'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
const labelClass = 'block text-sm font-medium text-gray-700'

export default function ForgotPasswordPage() {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => navigate('/login', { replace: true }), 2000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [step, navigate])

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setStep('verify')
      setToast({ message: 'OTP sent to your email.', type: 'success' })
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP.'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { resetToken: token } = await verifyOtp(email, otp.trim())
      setResetToken(token)
      setStep('reset')
      setToast({ message: 'OTP verified. Set your new password.', type: 'success' })
    } catch (err) {
      const message = err.response?.data?.message || 'OTP verification failed.'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword(resetToken, newPassword)
      setStep('success')
      setToast({ message: 'Password reset successfully.', type: 'success' })
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password.'
      setError(message)
      setToast({ message, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MarketingLayout activeNav="none">
      <div className="bg-gradient-to-b from-sky-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-blue-100/50 md:p-10">
            <div className="mb-2 inline-flex items-center justify-center rounded-xl bg-blue-100 p-3 text-blue-700">
              <FiKey size={26} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="mt-2 text-sm text-gray-600">We’ll send an OTP to verify your identity.</p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {step === 'request' && (
              <form onSubmit={handleRequestOtp} className="mt-6 space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
                <div>
                  <label className={labelClass}>OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={inputClass}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Verifying…' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Change email
                </button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label className={labelClass}>New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Updating…' : 'Reset Password'}
                </button>
              </form>
            )}

            {step === 'success' && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Password updated. Redirecting to login…
              </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-600">
              Remembered your password?{' '}
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
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: toast.type })} />
    </MarketingLayout>
  )
}
