import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Settings.css'

export default function Privacy() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [settings, setSettings] = useState({
    locationSharing: true,
    dataAnalytics: true,
    personalizedAds: false,
    shareUsageData: false,
    twoFactorAuth: false,
    biometricLogin: false
  })

  useEffect(() => {
    const saved = localStorage.getItem('privacySettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    localStorage.setItem('privacySettings', JSON.stringify(newSettings))
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

        <h1 className="page-title">Privacy & Security</h1>
        <p className="page-subtitle">Manage your data and security preferences</p>

        <section className="settings-section">
          <h2 className="section-title">Security</h2>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Two-Factor Authentication</span>
              <span className="toggle-description">Extra security for your account</span>
            </div>
            <button 
              className={`toggle-switch ${settings.twoFactorAuth ? 'active' : ''}`}
              onClick={() => handleToggle('twoFactorAuth')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Biometric Login</span>
              <span className="toggle-description">Use fingerprint or face ID</span>
            </div>
            <button 
              className={`toggle-switch ${settings.biometricLogin ? 'active' : ''}`}
              onClick={() => handleToggle('biometricLogin')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Change Password
          </button>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Data Privacy</h2>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Location Sharing</span>
              <span className="toggle-description">Allow app to use your location</span>
            </div>
            <button 
              className={`toggle-switch ${settings.locationSharing ? 'active' : ''}`}
              onClick={() => handleToggle('locationSharing')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Analytics</span>
              <span className="toggle-description">Help improve the app with usage data</span>
            </div>
            <button 
              className={`toggle-switch ${settings.dataAnalytics ? 'active' : ''}`}
              onClick={() => handleToggle('dataAnalytics')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Personalized Ads</span>
              <span className="toggle-description">See relevant advertisements</span>
            </div>
            <button 
              className={`toggle-switch ${settings.personalizedAds ? 'active' : ''}`}
              onClick={() => handleToggle('personalizedAds')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>

          <div className="toggle-item">
            <div className="toggle-info">
              <span className="toggle-label">Share Usage Data</span>
              <span className="toggle-description">Share with third-party partners</span>
            </div>
            <button 
              className={`toggle-switch ${settings.shareUsageData ? 'active' : ''}`}
              onClick={() => handleToggle('shareUsageData')}
            >
              <span className="toggle-slider"></span>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Data Management</h2>
          
          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download My Data
          </button>

          <button className="action-button danger">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete Account
          </button>
        </section>
      </div>
    </div>
  )
}
