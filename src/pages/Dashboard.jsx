import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [activeSessions, setActiveSessions] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [summaryData, sessions, bookings] = await Promise.all([
        api.get('/billing/summary'),
        api.get('/sessions/active'),
        api.get('/bookings')
      ])
      setSummary(summaryData)
      setActiveSessions(sessions)
      setRecentBookings(bookings.slice(0, 3))
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'Driver'}!</h1>
        <p>Here's an overview of your charging activity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <span className="stat-icon">⚡</span>
          <div>
            <span className="stat-value">{summary?.total_sessions || 0}</span>
            <span className="stat-label">Total Sessions</span>
          </div>
        </div>
        <div className="stat-card card">
          <span className="stat-icon">🔋</span>
          <div>
            <span className="stat-value">{parseFloat(summary?.total_energy || 0).toFixed(1)} kWh</span>
            <span className="stat-label">Energy Charged</span>
          </div>
        </div>
        <div className="stat-card card">
          <span className="stat-icon">💰</span>
          <div>
            <span className="stat-value">{formatCurrency(summary?.total_spent)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
        </div>
        <div className="stat-card card warning">
          <span className="stat-icon">📄</span>
          <div>
            <span className="stat-value">{summary?.pending_invoices || 0}</span>
            <span className="stat-label">Pending Invoices</span>
          </div>
        </div>
      </div>

      {activeSessions.length > 0 && (
        <div className="section">
          <h2>Active Charging</h2>
          <div className="active-session-banner card">
            <div className="pulse-indicator"></div>
            <div className="session-info">
              <h3>{activeSessions[0].station_name}</h3>
              <p>{activeSessions[0].connector_name}</p>
            </div>
            <Link to="/sessions" className="btn btn-primary">View Session</Link>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <Link to="/bookings" className="link">View All</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-card card">
              <p>No bookings yet</p>
              <Link to="/stations" className="btn btn-secondary">Find Stations</Link>
            </div>
          ) : (
            <div className="booking-list">
              {recentBookings.map(booking => (
                <div key={booking.id} className="booking-item card">
                  <div>
                    <h4>{booking.station_name}</h4>
                    <p>{new Date(booking.start_time).toLocaleDateString()}</p>
                  </div>
                  <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-info'}`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="actions-grid">
            <Link to="/stations" className="action-card card">
              <span className="action-icon">📍</span>
              <span>Find Stations</span>
            </Link>
            <Link to="/bookings" className="action-card card">
              <span className="action-icon">📅</span>
              <span>My Bookings</span>
            </Link>
            <Link to="/sessions" className="action-card card">
              <span className="action-icon">⚡</span>
              <span>Sessions</span>
            </Link>
            <Link to="/billing" className="action-card card">
              <span className="action-icon">💳</span>
              <span>Billing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
