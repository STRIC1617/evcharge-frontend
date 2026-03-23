import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import './Sessions.css'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showStopModal, setShowStopModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [energyInput, setEnergyInput] = useState('20')
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const [allSessions, active] = await Promise.all([
        api.get('/sessions'),
        api.get('/sessions/active')
      ])
      setSessions(allSessions)
      setActiveSessions(active)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const openStopModal = (session) => {
    setSelectedSession(session)
    setEnergyInput('20')
    setShowStopModal(true)
  }

  const handleStopSession = async () => {
    if (!selectedSession || !energyInput) return

    try {
      await api.post(`/sessions/${selectedSession.id}/stop`, { energy_kwh: parseFloat(energyInput) })
      setShowStopModal(false)
      setSelectedSession(null)
      setMessage({ type: 'success', text: 'Session completed! Invoice generated.' })
      setTimeout(() => setMessage(null), 3000)
      loadSessions()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (start, end) => {
    const ms = new Date(end || Date.now()) - new Date(start)
    const mins = Math.floor(ms / 60000)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) return `${hrs}h ${mins % 60}m`
    return `${mins}m`
  }

  const getFilteredSessions = () => {
    const completed = sessions.filter(s => s.status !== 'active')
    if (activeTab === 'all') return completed
    const now = new Date()
    if (activeTab === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return completed.filter(s => new Date(s.start_time) >= weekAgo)
    }
    if (activeTab === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return completed.filter(s => new Date(s.start_time) >= monthAgo)
    }
    return completed
  }

  const getTotalStats = () => {
    const filtered = getFilteredSessions()
    return {
      count: filtered.length,
      energy: filtered.reduce((sum, s) => sum + (parseFloat(s.energy_kwh) || 0), 0),
      cost: filtered.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0)
    }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <div className="sessions-page">
        <div className="loading-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="sessions-page">
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="sessions-header">
        <h1 className="page-title">Sessions</h1>
        <span className="sessions-count">{sessions.length} total</span>
      </div>

      {activeSessions.length > 0 && (
        <div className="active-section">
          <div className="section-label">
            <span className="pulse-dot"></span>
            <span>Active Now</span>
          </div>
          {activeSessions.map(session => (
            <div key={session.id} className="active-card">
              <div className="active-card-header">
                <div className="active-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="active-info">
                  <h3>{session.station_name}</h3>
                  <p>{session.connector_name} - {session.connector_type}</p>
                </div>
                <span className="charging-badge">Charging</span>
              </div>
              
              <div className="active-stats">
                <div className="active-stat">
                  <span className="active-stat-value">{formatDuration(session.start_time)}</span>
                  <span className="active-stat-label">Duration</span>
                </div>
                <div className="active-stat">
                  <span className="active-stat-value">{session.max_power_kw}kW</span>
                  <span className="active-stat-label">Max Power</span>
                </div>
              </div>
              
              <button onClick={() => openStopModal(session)} className="stop-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                Stop Charging
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="history-section">
        <div className="tabs-container">
          {['all', 'week', 'month'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All Time' : tab === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <div className="stats-summary">
          <div className="summary-stat">
            <span className="summary-icon">🔋</span>
            <div>
              <span className="summary-value">{stats.count}</span>
              <span className="summary-label">Sessions</span>
            </div>
          </div>
          <div className="summary-stat">
            <span className="summary-icon">⚡</span>
            <div>
              <span className="summary-value">{stats.energy.toFixed(1)}</span>
              <span className="summary-label">kWh</span>
            </div>
          </div>
          <div className="summary-stat">
            <span className="summary-icon">💵</span>
            <div>
              <span className="summary-value">${stats.cost.toFixed(2)}</span>
              <span className="summary-label">Spent</span>
            </div>
          </div>
        </div>

        {getFilteredSessions().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔌</div>
            <h3>No sessions yet</h3>
            <p>Start charging to see your history here</p>
          </div>
        ) : (
          <div className="sessions-list">
            {getFilteredSessions().map(session => (
              <div key={session.id} className="session-card">
                <div className="session-card-header">
                  <div className="session-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <div className="session-main-info">
                    <h3>{session.station_name}</h3>
                    <p>{session.connector_name}</p>
                  </div>
                  <span className={`status-badge ${session.status}`}>
                    {session.status === 'completed' ? 'Completed' : session.status}
                  </span>
                </div>

                <div className="session-meta">
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatDate(session.start_time)}
                  </span>
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    {session.connector_type}
                  </span>
                </div>

                <div className="session-stats-row">
                  <div className="stat-box">
                    <span className="stat-value">{formatDuration(session.start_time, session.end_time)}</span>
                    <span className="stat-label">Duration</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{session.energy_kwh || 0}</span>
                    <span className="stat-label">kWh</span>
                  </div>
                  <div className="stat-box highlight">
                    <span className="stat-value">${parseFloat(session.cost || 0).toFixed(2)}</span>
                    <span className="stat-label">Cost</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStopModal && (
        <div className="modal-overlay" onClick={() => setShowStopModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Stop Charging</h2>
              <button className="modal-close" onClick={() => setShowStopModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="modal-description">Enter the energy consumed at {selectedSession?.station_name}:</p>
            <div className="input-group">
              <input
                type="number"
                value={energyInput}
                onChange={(e) => setEnergyInput(e.target.value)}
                className="modal-input"
                placeholder="Energy"
                step="0.1"
                min="0"
              />
              <span className="input-suffix">kWh</span>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowStopModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleStopSession}>
                Stop Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
