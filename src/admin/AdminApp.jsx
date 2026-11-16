// src/admin/AdminApp.jsx — Admin Dashboard Protected Application Shell
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Complaints from './pages/Complaints'
import Workers from './pages/Workers'
import Reports from './pages/Reports'
import FeedbackPage from './pages/FeedbackPage'
import SurveyInsights from './pages/SurveyInsights'
import CommunityImpact from './pages/CommunityImpact'
import VillageMapComponent from './components/VillageMap'
import WardAnalytics from './pages/WardAnalytics'
import AssetRegistry from './pages/AssetRegistry'
import ResidentVerification from './pages/ResidentVerification'
import './index.css'

function VillageMapPage() {
  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Interactive Village Map — Vemavaram</h2>
          <p>Geospatial distribution of reported village complaints</p>
        </div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <VillageMapComponent />
      </div>
    </div>
  )
}

export default function AdminApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  // Strict role-based protection: only users with role === 'admin' can access
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="app-layout admin-theme">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-body">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="map" element={<VillageMapPage />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="resident-verification" element={<ResidentVerification />} />
            <Route path="workers" element={<Workers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="wards" element={<WardAnalytics />} />
            <Route path="assets" element={<AssetRegistry />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="survey" element={<SurveyInsights />} />
            <Route path="impact" element={<CommunityImpact />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
