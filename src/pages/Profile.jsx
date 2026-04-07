import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { api } from '../utils/api'
import './Profile.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const { theme, setThemeMode, colorScheme, setColorScheme } = useTheme()
  const navigate = useNavigate()
  const [notificationCount] = useState(2)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: '', license_plate: '', battery_capacity: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user) {
      loadVehicles()
    }
  }, [user])

  const loadVehicles = async () => {
    try {
      const data = await api.get('/vehicles')
      setVehicles(data)
    } catch (error) {
      console.error('Failed to load vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    try {
      await api.post('/vehicles', {
        ...vehicleForm,
        year: parseInt(vehicleForm.year),
        battery_capacity: parseFloat(vehicleForm.battery_capacity)
      })
      setShowAddVehicle(false)
      setVehicleForm({ make: '', model: '', year: '', license_plate: '', battery_capacity: '' })
      setMessage({ type: 'success', text: 'Vehicle added successfully!' })
      setTimeout(() => setMessage(null), 3000)
      loadVehicles()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const colorOptions = [
    { id: 'volt', name: 'Volt', color: '#00D4FF' },
    { id: 'eco', name: 'Eco', color: '#26F29F' },
    { id: 'inferno', name: 'Inferno', color: '#FF6B35' },
    { id: 'neon', name: 'Neon', color: '#B64CFF' },
  ]

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="login-prompt-card">
            <div className="prompt-icon">👤</div>
            <h2>Sign in to your account</h2>
            <p>Access your profile, vehicles, and settings</p>
            <div className="prompt-actions">
              <Link to="/login" className="btn btn-primary">Log In</Link>
              <Link to="/register" className="btn btn-secondary">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  const memberSince = new Date(user.created_at || Date.now()).getFullYear()

  return (
    <div className="profile-page">
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.type === 'success' ? '✓' : '!'} {message.text}
        </div>
      )}

      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-large">{initials}</div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-since">Member since {memberSince}</p>
        </div>

        <section className="settings-section">
          <h2 className="section-title">Appearance</h2>
          
          <div className="theme-toggle-group">
            <button 
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              Light
            </button>
            <button 
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Dark
            </button>
          </div>

          <div className="color-options">
            {colorOptions.map(option => (
              <button
                key={option.id}
                className={`color-option ${colorScheme === option.id ? 'active' : ''}`}
                style={{ '--option-color': option.color }}
                onClick={() => setColorScheme(option.id)}
                title={option.name}
              >
                {colorScheme === option.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="color-labels">
            {colorOptions.map(option => (
              <span key={option.id} className="color-label">{option.name}</span>
            ))}
          </div>
        </section>

        <section className="vehicle-section">
          <div className="section-header">
            <h2 className="section-title">My Vehicles</h2>
            <button className="add-vehicle-btn" onClick={() => setShowAddVehicle(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add
            </button>
          </div>

          {loading ? (
            <div className="vehicle-loading">
              <div className="skeleton-vehicle"></div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="no-vehicles">
              <div className="no-vehicles-icon">🚗</div>
              <p>No vehicles added yet</p>
              <button className="add-first-vehicle" onClick={() => setShowAddVehicle(true)}>
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="vehicles-list">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="vehicle-card-profile">
                  {index === 0 && <span className="vehicle-badge">PRIMARY</span>}
                  <div className="vehicle-details">
                    <h3>{vehicle.make} {vehicle.model}</h3>
                    <div className="vehicle-specs">
                      <span className="spec-item">{vehicle.year}</span>
                      <span className="spec-divider">•</span>
                      <span className="spec-item">{vehicle.battery_capacity} kWh</span>
                    </div>
                    {vehicle.license_plate && (
                      <p className="vehicle-plate">PLATE: {vehicle.license_plate}</p>
                    )}
                  </div>
                  <div className="vehicle-icon-wrapper">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.5 1 12.2 1 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="settings-section">
          <h2 className="section-title">Settings</h2>
          
          <div className="settings-list">
            <Link to="/notifications" className="settings-item">
              <div className="settings-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span className="settings-label">Notifications</span>
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
              <svg className="settings-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
            
            <Link to="/privacy" className="settings-item">
              <div className="settings-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="settings-label">Privacy & Security</span>
              <svg className="settings-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
            
            <Link to="/help" className="settings-item">
              <div className="settings-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span className="settings-label">Help & Support</span>
              <svg className="settings-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          </div>
        </section>

        <button className="logout-button" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log Out
        </button>
      </div>

      {showAddVehicle && (
        <div className="modal-overlay" onClick={() => setShowAddVehicle(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Vehicle</h2>
              <button className="modal-close" onClick={() => setShowAddVehicle(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="vehicle-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Make</label>
                  <input
                    type="text"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                    placeholder="e.g. Tesla"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                    placeholder="e.g. Model 3"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({...vehicleForm, year: e.target.value})}
                    placeholder="2024"
                    min="2010"
                    max="2030"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Battery (kWh)</label>
                  <input
                    type="number"
                    value={vehicleForm.battery_capacity}
                    onChange={(e) => setVehicleForm({...vehicleForm, battery_capacity: e.target.value})}
                    placeholder="75"
                    step="0.1"
                    required
                  />
                </div>
              </div>

              <div className="form-group full">
                <label>License Plate (Optional)</label>
                <input
                  type="text"
                  value={vehicleForm.license_plate}
                  onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value})}
                  placeholder="ABC-1234"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddVehicle(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
