// src/admin/components/Header.jsx — Admin Header
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdHome } from 'react-icons/md'

const titles = {
  '/admin/dashboard':             { title: 'Dashboard', sub: 'Overview of village complaints and metrics' },
  '/admin/map':                   { title: 'Interactive Village Map', sub: 'Geospatial analysis of infrastructure complaints' },
  '/admin/complaints':            { title: 'Complaints Management', sub: 'Manage, assign and resolve village complaints' },
  '/admin/resident-verification': { title: 'Resident Verification', sub: 'Review citizen residency applications and verification codes' },
  '/admin/workers':               { title: 'Workers Management', sub: 'Assign tasks and monitor field staff' },
  '/admin/reports':               { title: 'Reports & Export', sub: 'Generate and export CSV complaint reports' },
  '/admin/wards':                 { title: 'Ward Analytics', sub: 'Performance metrics across Wards 1 to 5' },
  '/admin/assets':                { title: 'Asset Registry', sub: 'Public infrastructure tracking' },
  '/admin/feedback':              { title: 'Citizen Feedback', sub: 'Post-resolution ratings and reviews' },
  '/admin/survey':                { title: 'Survey Insights', sub: 'Vemavaram Village field survey results' },
  '/admin/impact':                { title: 'Community Impact', sub: 'Civic performance and infrastructure health index' },
}

export default function Header() {
  const { pathname } = useLocation()
  const { user }     = useAuth()
  const meta = titles[pathname] || { title: 'Panchayat Administration', sub: 'Vemavaram Village Digital Governance' }

  return (
    <header className="header">
      <div className="header-left">
        <h1>{meta.title}</h1>
        <p>{meta.sub}</p>
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            color: '#1a56db',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            textDecoration: 'none'
          }}
          title="Return to Public Website"
        >
          <MdHome size={16} />
          <span>Village Portal</span>
        </Link>
        <div className="header-admin">
          <div className="admin-info">
            <strong>{user?.name || 'Mahitha'}</strong>
            <span>Panchayat Officer • Vemavaram</span>
          </div>
          <div className="admin-avatar">
            {(user?.name || 'A')[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
