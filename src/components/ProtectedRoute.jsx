import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  )
}

function AuthGate({ children, roles, guest }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner />

  if (guest) {
    if (!user) return children

    const isVendorLogin = location.pathname === '/login/vendor'
    const isAdminLogin = location.pathname === '/login/admin'

    if (isVendorLogin && user.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />
    }
    if (isAdminLogin && user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    return <Navigate to="/" replace />
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace state={{ message: 'Access denied' }} />
  }
  return children
}

export default function ProtectedRoute({ children }) {
  return <AuthGate>{children}</AuthGate>
}

export function GuestRoute({ children }) {
  return <AuthGate guest>{children}</AuthGate>
}

export function VendorRoute({ children }) {
  return <AuthGate roles={['vendor', 'admin']}>{children}</AuthGate>
}

/** Admin panel — only reachable at /admin (no app links or auto-redirects). */
export function AdminRoute({ children }) {
  return <AuthGate roles={['admin']}>{children}</AuthGate>
}
