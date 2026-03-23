import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './BottomNav.css'

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  
  const authPages = ['/login', '/register']
  if (authPages.includes(location.pathname)) {
    return null
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="bottom-nav-item" end>
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span className="nav-label">Home</span>
      </NavLink>

      <NavLink to="/journey" className="bottom-nav-item">
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        <span className="nav-label">Journey</span>
      </NavLink>

      <NavLink to="/charge" className="bottom-nav-item charge-item">
        <div className="charge-icon-wrapper">
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <span className="nav-label">Charge</span>
      </NavLink>

      <NavLink to="/history" className="bottom-nav-item">
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span className="nav-label">History</span>
      </NavLink>

      <NavLink to="/profile" className="bottom-nav-item">
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="nav-label">Profile</span>
      </NavLink>
    </nav>
  )
}
