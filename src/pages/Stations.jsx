import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../utils/api'
import './Stations.css'

export default function Stations() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState({ connector_type: '', power_type: '' })
  const [sortBy, setSortBy] = useState('name')
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    loadStations()
    getUserLocation()
  }, [])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 })
      )
    }
  }

  const calculateDistance = (lat, lng) => {
    if (!userLocation) return 999
    const R = 3959
    const dLat = (lat - userLocation.lat) * Math.PI / 180
    const dLng = (lng - userLocation.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const loadStations = async () => {
    try {
      const data = await api.get('/stations')
      setStations(data)
    } catch (error) {
      console.error('Failed to load stations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvailableCount = (connectors) => {
    if (!connectors || !Array.isArray(connectors)) return 0
    return connectors.filter(c => c && c.status === 'available').length
  }

  const getMaxPower = (connectors) => {
    if (!connectors || !Array.isArray(connectors)) return 0
    return Math.max(...connectors.map(c => c.max_power_kw || 0))
  }

  const getMinPrice = (connectors) => {
    if (!connectors || !Array.isArray(connectors) || connectors.length === 0) return 0
    return Math.min(...connectors.map(c => c.price_per_kwh || 0))
  }

  const filteredStations = stations
    .filter(station => {
      if (searchQuery && !station.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !station.address?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (filter.connector_type && !station.connectors?.some(c => c.connector_type === filter.connector_type)) {
        return false
      }
      if (filter.power_type && !station.connectors?.some(c => c.power_type === filter.power_type)) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return calculateDistance(a.latitude, a.longitude) - calculateDistance(b.latitude, b.longitude)
        case 'available':
          return getAvailableCount(b.connectors) - getAvailableCount(a.connectors)
        case 'power':
          return getMaxPower(b.connectors) - getMaxPower(a.connectors)
        case 'price':
          return getMinPrice(a.connectors) - getMinPrice(b.connectors)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const getAmenityIcon = (amenity) => {
    const icons = {
      'WiFi': '📶', 'Restroom': '🚻', 'Coffee': '☕', 'Cafe': '☕',
      'Shopping': '🛍️', 'Food Court': '🍔', 'Food': '🍔', 'Restaurant': '🍽️',
      'Security': '🔒', 'Vending': '🥤', 'Gas': '⛽', '24/7 Access': '🕐',
      'Lounge': '🛋️', 'Beach Access': '🏖️', 'Events': '🎫', 'Transit': '🚇',
      'Library': '📚', 'Scenic View': '🌅', 'News Stand': '📰', 'Food Truck': '🚚'
    }
    return icons[amenity] || '✨'
  }

  if (loading) {
    return (
      <div className="stations-page">
        <div className="loading-skeleton">
          {[1,2,3].map(i => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="stations-page">
      <div className="stations-header">
        <h1 className="page-title">Charging Stations</h1>
        <span className="station-count">{filteredStations.length} stations</span>
      </div>

      <div className="search-bar">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>

      <div className="filters-row">
        <select 
          className="filter-select"
          value={filter.connector_type}
          onChange={(e) => setFilter({ ...filter, connector_type: e.target.value })}
        >
          <option value="">All Connectors</option>
          <option value="CCS2">CCS2</option>
          <option value="TYPE2">Type 2</option>
          <option value="TESLA">Tesla</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>
        
        <select 
          className="filter-select"
          value={filter.power_type}
          onChange={(e) => setFilter({ ...filter, power_type: e.target.value })}
        >
          <option value="">All Power</option>
          <option value="AC">AC</option>
          <option value="DC">DC Fast</option>
        </select>

        <select 
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          <option value="distance">Sort: Distance</option>
          <option value="available">Sort: Availability</option>
          <option value="power">Sort: Power</option>
          <option value="price">Sort: Price</option>
        </select>
      </div>

      <div className="stations-grid">
        {filteredStations.map(station => {
          const available = getAvailableCount(station.connectors)
          const total = station.connectors?.length || 0
          const maxPower = getMaxPower(station.connectors)
          const minPrice = getMinPrice(station.connectors)
          const distance = calculateDistance(station.latitude, station.longitude)

          return (
            <Link to={`/stations/${station.id}`} key={station.id} className="station-card">
              <div className="station-card-header">
                <div className="station-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div className="station-title-section">
                  <h3 className="station-name">{station.name}</h3>
                  <p className="station-operator">{station.operator_name}</p>
                </div>
                <span className={`availability-indicator ${available > 0 ? 'available' : 'busy'}`}>
                  {available > 0 ? 'Open' : 'Busy'}
                </span>
              </div>

              <p className="station-address">{station.address}</p>

              <div className="station-stats-row">
                <div className="stat-chip">
                  <span className="stat-icon">📍</span>
                  <span>{distance.toFixed(1)} mi</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-icon">⚡</span>
                  <span>{maxPower}kW</span>
                </div>
                <div className="stat-chip">
                  <span className="stat-icon">💰</span>
                  <span>${minPrice.toFixed(2)}/kWh</span>
                </div>
              </div>

              <div className="connectors-bar">
                <div className="connectors-info">
                  <span className="connectors-label">Connectors</span>
                  <span className="connectors-count">{available}/{total} available</span>
                </div>
                <div className="connectors-progress">
                  <div 
                    className="connectors-fill" 
                    style={{ width: `${total > 0 ? (available / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {station.amenities && station.amenities.length > 0 && (
                <div className="amenities-row">
                  {station.amenities.slice(0, 4).map((amenity, i) => (
                    <span key={i} className="amenity-chip" title={amenity}>
                      {getAmenityIcon(amenity)}
                    </span>
                  ))}
                  {station.amenities.length > 4 && (
                    <span className="amenity-more">+{station.amenities.length - 4}</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>No stations found</h3>
          <p>Try adjusting your filters or search query</p>
          <button className="reset-btn" onClick={() => {
            setSearchQuery('')
            setFilter({ connector_type: '', power_type: '' })
          }}>Reset Filters</button>
        </div>
      )}
    </div>
  )
}
