import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Settings.css'

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    chargingUpdates: true,
    bookingReminders: true,
    promotions: false,
    maintenanceAlerts: true,
    billingAlerts: true
  })

  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings))
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <button className="back-button" onClick={() => navigate('/profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Manage how you receive updates</p>

        <section className="settings-section">
          <h2 className="section-title">Notification Channels</h2>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Push Notifications</span>
              <span className="toggle-description">Receive alerts on your device</span>
            </div>
            <button 
              className={`toggle-switch ${settings.pushNotifications ? 'active' : ''}`}
              onClick={() => handleToggle('pushNotifications')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Email Notifications</span>
              <span className="toggle-description">Get updates via email</span>
            </div>
            <button 
              className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
              onClick={() => handleToggle('emailNotifications')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">SMS Notifications</span>
              <span className="toggle-description">Receive text messages</span>
            </div>
            <button 
              className={`toggle-switch ${settings.smsNotifications ? 'active' : ''}`}
              onClick={() => handleToggle('smsNotifications')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Alert Types</h2>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Charging Updates</span>
              <span className="toggle-description">Status changes while charging</span>
            </div>
            <button 
              className={`toggle-switch ${settings.chargingUpdates ? 'active' : ''}`}
              onClick={() => handleToggle('chargingUpdates')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Booking Reminders</span>
              <span className="toggle-description">Upcoming reservation alerts</span>
            </div>
            <button 
              className={`toggle-switch ${settings.bookingReminders ? 'active' : ''}`}
              onClick={() => handleToggle('bookingReminders')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Billing Alerts</span>
              <span className="toggle-description">Payment and invoice notifications</span>
            </div>
            <button 
              className={`toggle-switch ${settings.billingAlerts ? 'active' : ''}`}
              onClick={() => handleToggle('billingAlerts')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Maintenance Alerts</span>
              <span className="toggle-description">Station status and outages</span>
            </div>
            <button 
              className={`toggle-switch ${settings.maintenanceAlerts ? 'active' : ''}`}
              onClick={() => handleToggle('maintenanceAlerts')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Promotions & Offers</span>
              <span className="toggle-description">Deals and special discounts</span>
            </div>
            <button 
              className={`toggle-switch ${settings.promotions ? 'active' : ''}`}
              onClick={() => handleToggle('promotions')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
