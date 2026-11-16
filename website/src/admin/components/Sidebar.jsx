// src/admin/components/Sidebar.jsx — Admin Dashboard Navigation Sidebar
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdReportProblem, MdPeople,
  MdBarChart, MdFeedback, MdInsights, MdLogout, MdMap, MdPublic, MdLocationCity, MdCategory,
  MdVerifiedUser, MdArrowBack
} from 'react-icons/md'

const nav = [
  { to: '/admin/dashboard',             icon: <MdDashboard />,     label: 'Dashboard' },
  { to: '/admin/map',                   icon: <MdMap />,           label: 'Village Map' },
  { to: '/admin/complaints',            icon: <MdReportProblem />,  label: 'Complaints' },
  { to: '/admin/resident-verification', icon: <MdVerifiedUser />, label: 'Resident Verification' },
  { to: '/admin/workers',               icon: <MdPeople />,         label: 'Workers' },
  { to: '/admin/reports',               icon: <MdBarChart />,        label: 'Reports' },
  { to: '/admin/wards',                 icon: <MdLocationCity />,    label: 'Ward Analytics' },
  { to: '/admin/assets',                icon: <MdCategory />,        label: 'Assets Registry' },
  { to: '/admin/feedback',              icon: <MdFeedback />,        label: 'Feedback' },
  { to: '/admin/survey',                icon: <MdInsights />,        label: 'Survey Insights' },
  { to: '/admin/impact',                icon: <MdPublic />,          label: 'Community Impact' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="village-badge">
          <div className="icon">🏛️</div>
          <div>
            <h2>Vemavaram Village</h2>
            <p>Panchayat Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link
          to="/"
          className="nav-item"
          style={{ textDecoration: 'none', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <MdArrowBack />
          <span>Village Portal</span>
        </Link>
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </div>
    </aside>
  )
}
