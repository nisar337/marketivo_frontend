import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

import { syncStoredFromServerUser } from '../utils/customerLocation'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(data.user)
      syncStoredFromServerUser(data.user)
    } catch {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    syncStoredFromServerUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/register`, formData)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    syncStoredFromServerUser(data.user)
    return data
  }

  const registerRequest = async (formData) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/register-request`, formData)
    return data
  }

  const verifyRegistration = async ({ email, otp }) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/verify-registration`, { email, otp })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    syncStoredFromServerUser(data.user)
    return data
  }

  const resendRegisterOtp = async (email) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/resend-register-otp`, { email })
    return data
  }

  const forgotPassword = async (email) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email })
    return data
  }

  const verifyOtp = async (email, otp) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { email, otp })
    return data
  }

  const resetPassword = async (resetToken, newPassword) => {
    const { data } = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { resetToken, newPassword })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const setAuth = (newToken, newUser) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const mergeUserFromServer = useCallback((partial) => {
    setUser((prev) => {
      if (!prev) return prev
      if (partial?.vendor && prev.vendor) {
        return { ...prev, ...partial, vendor: { ...prev.vendor, ...partial.vendor } }
      }
      if (partial?.vendor) {
        return { ...prev, ...partial }
      }
      return { ...prev, ...partial }
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!token) return null
    const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setUser(data.user)
    syncStoredFromServerUser(data.user)
    return data.user
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        registerRequest,
        verifyRegistration,
        resendRegisterOtp,
        forgotPassword,
        verifyOtp,
        resetPassword,
        logout,
        refreshProfile,
        mergeUserFromServer,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
