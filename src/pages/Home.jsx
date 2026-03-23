import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import './Home.css'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good Morning')
  const [activeSession, setActiveSession] = useState(null)
  const [upcomingBooking, setUpcomingBooking] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [stats, setStats] = useState({ sessions: 0, energy: 0, spending: 0 })
  const [userLocation, setUserLocation] = useState(null)
  const [promoIndex, setPromoIndex] = useState(0)

  const promos = [
    { title: '20% Off First Charge', subtitle: 'New user special', color: '#26F29F' },
    { title: 'Free Charging Fridays', subtitle: 'At select stations', color: '#00D4FF' },
    { title: 'Refer & Earn', subtitle: 'Get $10 credit per referral', color: '#FF6B35' }
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  useEffect(() => {
    loadStations()
    getUserLocation()
    if (user) {
      loadActiveSession()
      loadUpcomingBooking()
      loadRecentSessions()
      loadStats()
    }
  }, [user])

  useEffect(() => {
    const interval = setInterval(() => {
      setPromoIndex(prev => (prev + 1) % promos.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 })
      )
    }
  }

  const calculateDistance = (stationLat, stationLng) => {
    if (!userLocation) return null
    const R = 3959
    const dLat = (stationLat - userLocation.lat) * Math.PI / 180
    const dLng = (stationLng - userLocation.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(stationLat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
  }

  const loadStations = async () => {
    try {
      const data = await api.get('/stations')
      setStations(data.slice(0, 3))
    } catch (error) {
      console.error('Failed to load stations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadActiveSession = async () => {
    try {
      const sessions = await api.get('/sessions/active')
      if (sessions.length > 0) setActiveSession(sessions[0])
    } catch (error) {
      console.error('Failed to load active session:', error)
    }
  }

  const loadUpcomingBooking = async () => {
    try {
      const bookings = await api.get('/bookings')
      const futureBookings = bookings
        .filter(b => b.status === 'confirmed' && new Date(b.start_time) > new Date())
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      setUpcomingBooking(futureBookings[0] || null)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    }
  }

  const loadRecentSessions = async () => {
    try {
      const sessions = await api.get('/sessions')
      setRecentSessions(sessions.filter(s => s.status === 'completed').slice(0, 3))
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadStats = async () => {
    try {
      const summary = await api.get('/billing/summary')
      const sessions = await api.get('/sessions')
      const completedSessions = sessions.filter(s => s.status === 'completed')
      const totalEnergy = completedSessions.reduce((sum, s) => sum + (s.energy_kwh || 0), 0)
      setStats({
        sessions: completedSessions.length,
        energy: totalEnergy,
        spending: summary.total_amount || 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const getAvailableConnectors = (station) => {
    if (!station.connectors) return 0
    return station.connectors.filter(c => c.status === 'available').length
  }

  const getTotalConnectors = (station) => {
    return station.connectors?.length || 0
  }

  const co2Saved = (stats.energy * 0.4).toFixed(1)
  const gasMilesAvoided = Math.round(stats.energy * 3.5)

  const userName = user?.name?.split(' ')[0] || 'Driver'
  const batteryPercent = 68

  const findNearestStation = () => {
    navigate('/journey')
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="home-header">
          <div className="greeting-section">
            <h1 className="greeting">{greeting},</h1>
            <p className="user-name">{user ? userName : 'Guest'}</p>
          </div>
          <div className="header-right">
            <div className="weather-widget">
              <span className="weather-icon">☀️</span>
              <span className="weather-temp">72°F</span>
            </div>
            <div className="avatar">
              {user ? user.name?.split(' ').map(n => n[0]).join('').toUpperCase() : 'G'}
            </div>
          </div>
        </header>

        {activeSession && (
          <Link to="/charge" className="active-session-banner">
            <div className="session-pulse"></div>
            <div className="session-info">
              <span className="session-label">Charging in Progress</span>
              <span className="session-station">{activeSession.station_name}</span>
            </div>
            <div className="session-stats">
              <span className="session-energy">{activeSession.energy_kwh?.toFixed(1) || 0} kWh</span>
              <span className="session-power">{activeSession.max_power_kw || 0} kW</span>
            </div>
            <svg className="session-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        )}

        <div className="promo-carousel">
          {promos.map((promo, idx) => (
            <div 
              key={idx} 
              className={`promo-card ${idx === promoIndex ? 'active' : ''}`}
              style={{ '--promo-color': promo.color }}
            >
              <div className="promo-content">
                <span className="promo-title">{promo.title}</span>
                <span className="promo-subtitle">{promo.subtitle}</span>
              </div>
              <div className="promo-badge">NEW</div>
            </div>
          ))}
          <div className="promo-dots">
            {promos.map((_, idx) => (
              <span key={idx} className={`dot ${idx === promoIndex ? 'active' : ''}`} onClick={() => setPromoIndex(idx)}/>
            ))}
          </div>
        </div>

        {user && (
          <div className="vehicle-card">
            <div className="vehicle-info">
              <span className="vehicle-label">Current Range</span>
              <div className="range-display">
                <span className="range-value">192</span>
                <span className="range-unit">mi</span>
              </div>
              <div className="vehicle-name">
                <span className="vehicle-icon">⚡</span>
                Porsche Taycan 4S
              </div>
            </div>
            <div className="battery-display animated">
              <div className="battery-ring">
                <svg viewBox="0 0 36 36" className="battery-svg">
                  <path
                    className="battery-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="battery-fill"
                    strokeDasharray={`${batteryPercent}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="battery-percent">{batteryPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{stats.sessions}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔋</span>
              <span className="stat-value">{stats.energy.toFixed(1)}</span>
              <span className="stat-label">kWh Used</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">💰</span>
              <span className="stat-value">${stats.spending.toFixed(0)}</span>
              <span className="stat-label">Spent</span>
            </div>
          </div>
        )}

        {user && (
          <div className="eco-impact">
            <div className="eco-header">
              <span className="eco-icon">🌱</span>
              <span className="eco-title">Your Eco Impact</span>
            </div>
            <div className="eco-stats">
              <div className="eco-stat">
                <span className="eco-value">{co2Saved} kg</span>
                <span className="eco-label">CO₂ Saved</span>
              </div>
              <div className="eco-divider"></div>
              <div className="eco-stat">
                <span className="eco-value">{gasMilesAvoided} mi</span>
                <span className="eco-label">Gas Miles Avoided</span>
              </div>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link to="/journey" className="action-button">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
              </svg>
            </div>
            <span>Plan Journey</span>
          </Link>
          <Link to="/charge" className="action-button">
            <div className="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span>Start Charging</span>
          </Link>
        </div>

        <button className="find-nearest-btn" onClick={findNearestStation}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Find Nearest Charger
        </button>

        {upcomingBooking && (
          <section className="upcoming-section">
            <div className="section-header">
              <h2 className="section-title">Upcoming Booking</h2>
            </div>
            <Link to={`/bookings/${upcomingBooking.id}`} className="upcoming-card">
              <div className="upcoming-icon">📅</div>
              <div className="upcoming-info">
                <span className="upcoming-station">{upcomingBooking.station_name}</span>
                <span className="upcoming-time">
                  {new Date(upcomingBooking.start_time).toLocaleDateString()} at {new Date(upcomingBooking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <span className="upcoming-connector">Connector {upcomingBooking.connector_id}</span>
            </Link>
          </section>
        )}

        {recentSessions.length > 0 && (
          <section className="recent-section">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <Link to="/sessions" className="view-all-link">View All ›</Link>
            </div>
            <div className="recent-list">
              {recentSessions.map(session => (
                <div key={session.id} className="recent-card">
                  <div className="recent-icon">⚡</div>
                  <div className="recent-info">
                    <span className="recent-station">{session.station_name || 'Charging Station'}</span>
                    <span className="recent-date">{new Date(session.end_time).toLocaleDateString()}</span>
                  </div>
                  <div className="recent-stats">
                    <span className="recent-energy">{session.energy_kwh?.toFixed(1) || 0} kWh</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="nearby-section">
          <div className="section-header">
            <h2 className="section-title">Nearby Stations</h2>
            <Link to="/stations" className="view-all-link">View All ›</Link>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="stations-list">
              {stations.map(station => (
                <Link to={`/stations/${station.id}`} key={station.id} className="station-card">
                  <div className="station-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div className="station-info">
                    <h3 className="station-name">{station.name}</h3>
                    <div className="station-meta">
                      <span className="station-distance">
                        {calculateDistance(station.latitude, station.longitude) || '—'} mi
                      </span>
                      <span className="station-availability">
                        {getAvailableConnectors(station)}/{getTotalConnectors(station)} available
                      </span>
                    </div>
                  </div>
                  <div className="station-status">
                    <span className={`availability-badge ${getAvailableConnectors(station) > 0 ? 'available' : 'busy'}`}>
                      {getAvailableConnectors(station) > 0 ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="favorites-section">
          <div className="section-header">
            <h2 className="section-title">Favorite Stations</h2>
          </div>
          <div className="favorites-placeholder">
            <span className="favorites-icon">⭐</span>
            <p>Star stations to add them here for quick access</p>
          </div>
        </section>
      </div>
    </div>
  )
}
