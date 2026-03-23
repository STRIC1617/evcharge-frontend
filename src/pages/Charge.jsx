import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../utils/api'
import './Charge.css'

export default function Charge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStopModal, setShowStopModal] = useState(false)
  const [energyInput, setEnergyInput] = useState('20')
  const [message, setMessage] = useState(null)
  const [chargingStats, setChargingStats] = useState({
    power: 0,
    added: 0,
    timeLeft: '--'
  })
  const [batteryPercent, setBatteryPercent] = useState(68)

  useEffect(() => {
    if (user) {
      loadActiveSession()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadActiveSession = async () => {
    try {
      const sessions = await api.get('/sessions/active')
      if (sessions.length > 0) {
        setActiveSession(sessions[0])
        setChargingStats({
          power: sessions[0].max_power_kw || 0,
          added: sessions[0].energy_kwh || 0,
          timeLeft: calculateTimeLeft(sessions[0])
        })
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeLeft = (session) => {
    if (!session) return '--'
    const elapsed = (Date.now() - new Date(session.start_time).getTime()) / 60000
    const remaining = Math.max(0, 60 - elapsed)
    return `${Math.floor(remaining)}m`
  }

  const startCharging = () => {
    if (!user) {
      setMessage({ type: 'info', text: 'Please log in to start charging' })
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    setMessage({ type: 'info', text: 'Navigate to Stations to book a connector and start a session' })
    setTimeout(() => navigate('/stations'), 2000)
  }

  const handleStopCharging = async () => {
    if (!activeSession || !energyInput) return

    try {
      await api.post(`/sessions/${activeSession.id}/stop`, { energy_kwh: parseFloat(energyInput) })
      setShowStopModal(false)
      setMessage({ type: 'success', text: 'Session completed! Invoice generated.' })
      setActiveSession(null)
      setTimeout(() => setMessage(null), 3000)
      loadActiveSession()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    }
  }

  const circles = [
    { radius: 90, strokeWidth: 4, rangeStart: 0, rangeEnd: 33 },
    { radius: 75, strokeWidth: 3, rangeStart: 33, rangeEnd: 66 },
    { radius: 60, strokeWidth: 2, rangeStart: 66, rangeEnd: 100 }
  ]

  const getRingProgress = (ringIndex, percent) => {
    const ring = circles[ringIndex]
    if (percent <= ring.rangeStart) return 0
    if (percent >= ring.rangeEnd) return 100
    return ((percent - ring.rangeStart) / (ring.rangeEnd - ring.rangeStart)) * 100
  }

  return (
    <div className="charge-page">
      <div className="charge-container">
        {message && (
          <div className={`message-toast ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="charge-header">
          <span className="charge-status">
            {activeSession ? 'Charging' : 'Ready to Charge'}
          </span>
          <h1 className="station-name">
            {activeSession ? activeSession.station_name : 'Supercharger A4'}
          </h1>
          <p className="vehicle-name">Porsche Taycan 4S</p>
        </div>

        <div className="battery-gauge">
          <svg className="gauge-svg" viewBox="0 0 200 200">
            <defs>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {circles.map((circle, index) => {
              const circumference = 2 * Math.PI * circle.radius
              const ringProgress = getRingProgress(index, batteryPercent)
              const dashOffset = circumference - (ringProgress / 100) * circumference
              return (
                <g key={index}>
                  <circle 
                    className="gauge-background"
                    cx="100" 
                    cy="100" 
                    r={circle.radius}
                    fill="none"
                    strokeWidth={circle.strokeWidth}
                    strokeDasharray="4 8"
                    opacity={0.3 - index * 0.05}
                  />
                  <circle 
                    className={`gauge-progress ring-${index + 1} ${activeSession ? 'charging' : ''}`}
                    cx="100" 
                    cy="100" 
                    r={circle.radius}
                    fill="none"
                    strokeWidth={circle.strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    filter="url(#neonGlow)"
                    style={{ 
                      transformOrigin: '100px 100px',
                      opacity: ringProgress > 0 ? (1 - index * 0.15) : 0.1
                    }}
                  />
                </g>
              )
            })}
          </svg>
          <div className="gauge-center">
            <span className="battery-value">{batteryPercent}%</span>
          </div>
        </div>

        <div className="charging-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span className="stat-value">{chargingStats.power}kW</span>
            <span className="stat-label">POWER</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                <circle cx="12" cy="20" r="1"/>
              </svg>
            </div>
            <span className="stat-value">{chargingStats.added.toFixed(1)} kWh</span>
            <span className="stat-label">ADDED</span>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="stat-value">{chargingStats.timeLeft}</span>
            <span className="stat-label">TIME LEFT</span>
          </div>
        </div>

        <button 
          className={`charge-button ${activeSession ? 'stop' : 'start'}`}
          onClick={activeSession ? () => setShowStopModal(true) : startCharging}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            {activeSession ? (
              <rect x="9" y="9" width="6" height="6"/>
            ) : (
              <polygon points="10 8 16 12 10 16 10 8"/>
            )}
          </svg>
          <span>{activeSession ? 'Stop Charging' : 'Start Charging'}</span>
        </button>

        {loading && <div className="loading">Loading...</div>}

        {showStopModal && (
          <div className="modal-overlay" onClick={() => setShowStopModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>Stop Charging</h2>
              <p>Enter the energy consumed during this session:</p>
              <div className="input-group">
                <input
                  type="number"
                  value={energyInput}
                  onChange={(e) => setEnergyInput(e.target.value)}
                  className="input"
                  placeholder="Energy (kWh)"
                  step="0.1"
                  min="0"
                />
                <span className="input-suffix">kWh</span>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowStopModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleStopCharging}>
                  Stop Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
