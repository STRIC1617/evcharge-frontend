import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import './StationDetail.css'

export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState({
    connector_id: '',
    start_time: '',
    end_time: ''
  })
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    loadStation()
  }, [id])

  const loadStation = async () => {
    try {
      const data = await api.get(`/stations/${id}`)
      setStation(data)
    } catch (error) {
      console.error('Failed to load station:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setBookingError('')
    try {
      await api.post('/bookings', {
        station_id: parseInt(id),
        connector_id: parseInt(booking.connector_id),
        start_time: booking.start_time,
        end_time: booking.end_time
      })
      setBookingSuccess(true)
      setTimeout(() => navigate('/bookings'), 2000)
    } catch (error) {
      setBookingError(error.message)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!station) return <div className="container"><p>Station not found</p></div>

  return (
    <div className="station-detail container">
      <div className="station-info card">
        <div className="station-header">
          <div>
            <h1>{station.name}</h1>
            <p className="address">{station.address}</p>
            <p className="operator">{station.operator_name}</p>
          </div>
          <span className={`badge ${station.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
            {station.status}
          </span>
        </div>

        {station.amenities && station.amenities.length > 0 && (
          <div className="amenities-section">
            <h3>Amenities</h3>
            <div className="amenities-list">
              {station.amenities.map((a, i) => (
                <span key={i} className="amenity-tag">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="connectors-section">
        <h2>Connectors</h2>
        <div className="connectors-grid">
          {station.connectors?.map(connector => (
            <div key={connector.id} className={`connector-card card ${connector.status !== 'available' ? 'unavailable' : ''}`}>
              <div className="connector-header">
                <span className="connector-name">{connector.name}</span>
                <span className={`badge ${connector.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                  {connector.status}
                </span>
              </div>
              <div className="connector-details">
                <div className="detail">
                  <span className="label">Type</span>
                  <span className="value">{connector.connector_type}</span>
                </div>
                <div className="detail">
                  <span className="label">Power</span>
                  <span className="value">{connector.power_type} {connector.max_power_kw}kW</span>
                </div>
                <div className="detail">
                  <span className="label">Price</span>
                  <span className="value">${connector.price_per_kwh}/kWh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="booking-section card">
        <h2>Book a Connector</h2>
        
        {bookingSuccess ? (
          <div className="success-message">
            Booking confirmed! Redirecting to your bookings...
          </div>
        ) : (
          <form onSubmit={handleBook} className="booking-form">
            {bookingError && <div className="error-message">{bookingError}</div>}
            
            <div className="form-group">
              <label className="label">Select Connector</label>
              <select 
                className="input" 
                value={booking.connector_id}
                onChange={(e) => setBooking({ ...booking, connector_id: e.target.value })}
                required
              >
                <option value="">Choose a connector</option>
                {station.connectors?.filter(c => c.status === 'available').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.connector_type} {c.max_power_kw}kW (${c.price_per_kwh}/kWh)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="label">Start Time</label>
                <input 
                  type="datetime-local" 
                  className="input"
                  value={booking.start_time}
                  onChange={(e) => setBooking({ ...booking, start_time: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">End Time</label>
                <input 
                  type="datetime-local" 
                  className="input"
                  value={booking.end_time}
                  onChange={(e) => setBooking({ ...booking, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {user ? 'Book Now' : 'Login to Book'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
