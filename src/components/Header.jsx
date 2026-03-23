import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import './Header.css'

export default function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Charge Connect</span>
        </Link>
        
        <div className="header-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/stations" className="nav-link" onClick={closeMobileMenu}>Stations</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/bookings" className="nav-link" onClick={closeMobileMenu}>Bookings</Link>
              <Link to="/sessions" className="nav-link" onClick={closeMobileMenu}>Sessions</Link>
              <Link to="/billing" className="nav-link" onClick={closeMobileMenu}>Billing</Link>
              <div className="user-menu">
                <span className="user-name">{user.name || user.email}</span>
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMobileMenu}>Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
