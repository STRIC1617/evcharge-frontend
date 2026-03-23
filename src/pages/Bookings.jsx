import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import './Bookings.css'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const data = await api.get('/bookings')
      setBookings(data)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await api.patch(`/bookings/${id}/cancel`)
      loadBookings()
    } catch (error) {
      alert(error.message)
    }
  }

  const startSession = async (booking) => {
    try {
      await api.post('/sessions/start', {
        booking_id: booking.id,
        station_id: booking.station_id,
        connector_id: booking.connector_id
      })
      alert('Session started!')
      loadBookings()
    } catch (error) {
      alert(error.message)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      in_progress: 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    }
    return classes[status] || 'badge-info'
  }

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="bookings-page container">
      <h1 className="page-title">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="empty-state card">
          <p>You don't have any bookings yet.</p>
          <a href="/stations" className="btn btn-primary">Find Stations</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.id} className="booking-card card">
              <div className="booking-header">
                <div>
                  <h3>{booking.station_name}</h3>
                  <p className="booking-address">{booking.station_address}</p>
                </div>
                <span className={`badge ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Connector:</span>
                  <span>{booking.connector_name} ({booking.connector_type})</span>
                </div>
                <div className="detail-row">
                  <span className="label">Start:</span>
                  <span>{formatDate(booking.start_time)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">End:</span>
                  <span>{formatDate(booking.end_time)}</span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status === 'confirmed' && (
                  <>
                    <button 
                      onClick={() => startSession(booking)} 
                      className="btn btn-primary"
                    >
                      Start Charging
                    </button>
                    <button 
                      onClick={() => cancelBooking(booking.id)} 
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
