// src/admin/pages/Login.jsx — Official Admin Portal Login
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/api'
import toast from 'react-hot-toast'
import '../index.css'

export default function Login() {
  const [credential, setCredential] = useState('')
  const [password,   setPassword]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    const trimmed = credential.trim()
    if (!trimmed || !password) {
      toast.error('Please enter your admin mobile number or official email and password')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.adminLogin(trimmed, password)
      const payload = data.data
      if (payload?.user?.role !== 'admin') {
        toast.error('Access denied. Administrator privileges required.')
        return
      }
      login(payload, payload.user)
      toast.success(`Welcome back, ${payload.user.name || 'Admin'}!`)
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid admin credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏛️</div>
        <h1>Vemavaram Village CSP</h1>
        <p className="subtitle">Complaint Redressal System — Panchayat Admin Portal</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Mobile Number or Official Email</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. 8330922711 or official email"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <Link
            to="/"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#1a56db',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            ← Back to Public Village Website
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Official Vemavaram Gram Panchayat Administration • Authorized Officers Only
        </p>
      </div>
    </div>
  )
}
