import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute, { GuestRoute, VendorRoute, AdminRoute } from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import VendorDashboard from './pages/VendorDashboard'
import AdminPage from './pages/AdminPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/MyOrdersPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import VendorsPage from './pages/VendorsPage'
import CategoriesPage from './pages/CategoriesPage'
import DealsPage from './pages/DealsPage'
import VendorProfilePage from './pages/VendorProfilePage'
import ProductPage from './pages/ProductPage'
import ChatBot from './components/Chat/ChatBot'
import SplashScreen from './components/SplashScreen'

function ChatBotGate() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null
  return <ChatBot />
}

function AnimatedRoutes({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('marketivo_splash_seen')
  })

  const handleSplashDone = () => {
    sessionStorage.setItem('marketivo_splash_seen', '1')
    setShowSplash(false)
  }

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <ThemeProvider>
      <AuthProvider>
        <CartProvider>
        <AnimatedRoutes>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Navigate to="/" state={{ authModal: 'login' }} replace />} />
          <Route path="/login/vendor" element={<Navigate to="/" state={{ authModal: 'login' }} replace />} />
          <Route path="/login/admin" element={<Navigate to="/" state={{ authModal: 'login' }} replace />} />
          <Route
            path="/admin/login"
            element={
              <GuestRoute>
                <LoginPage role="admin" />
              </GuestRoute>
            }
          />
          <Route path="/register" element={<Navigate to="/" state={{ authModal: 'register' }} replace />} />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/vendor/:id" element={<VendorProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AnimatedRoutes>
        <ChatBotGate />
        </CartProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
