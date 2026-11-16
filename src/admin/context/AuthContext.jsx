// src/admin/context/AuthContext.jsx — Admin Auth Context
import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_access_token') || localStorage.getItem('access_token')
    const savedUserStr = localStorage.getItem('admin_user')
    let savedUser = null
    try {
      if (savedUserStr) savedUser = JSON.parse(savedUserStr)
    } catch (e) {}

    if (token) {
      if (savedUser && savedUser.role === 'admin') {
        setUser(savedUser)
      }
      authApi.getMe()
        .then(r => {
          const u = r.data?.data
          if (u && u.role === 'admin') {
            setUser(u)
            localStorage.setItem('admin_user', JSON.stringify(u))
          } else {
            localStorage.removeItem('admin_access_token')
            localStorage.removeItem('access_token')
            localStorage.removeItem('admin_user')
            setUser(null)
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('access_token')
          localStorage.removeItem('admin_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (tokens, userData) => {
    if (!userData || userData.role !== 'admin') {
      throw new Error('Access denied. Administrator privileges required.')
    }
    localStorage.setItem('admin_access_token',  tokens.access_token)
    localStorage.setItem('access_token',        tokens.access_token)
    if (tokens.refresh_token) {
      localStorage.setItem('admin_refresh_token', tokens.refresh_token)
      localStorage.setItem('refresh_token',       tokens.refresh_token)
    }
    localStorage.setItem('admin_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('admin_user')
    setUser(null)
  }

  return (
    <AdminAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext)
export const useAuth = () => useContext(AdminAuthContext)
export default AdminAuthContext
