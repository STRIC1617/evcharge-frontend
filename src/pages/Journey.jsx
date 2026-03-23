import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import 'leaflet/dist/leaflet.css'
import './Journey.css'

export default function Journey() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [stations, setStations] = useState([])
  const [selectedStation, setSelectedStation] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const routeLayerRef = useRef(null)

  useEffect(() => {
    fetchStations()
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation && !mapInstanceRef.current) {
      initMap()
    }
  }, [userLocation])

  useEffect(() => {
    if (mapLoaded && stations.length > 0 && mapInstanceRef.current) {
      addStationMarkers()
    }
  }, [mapLoaded, stations])

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const getAvailableConnectors = (station) => {
    if (!station.connectors) return 0
    return station.connectors.filter(c => c.status === 'available').length
  }

  const getTotalConnectors = (station) => {
    return station.connectors?.length || 0
  }

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/stations')
      if (res.ok) {
        const data = await res.json()
        setStations(data)
      }
    } catch (err) {
      console.error('Failed to fetch stations:', err)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 })
    }
  }

  const initMap = async () => {
    try {
      const L = await import('leaflet')
      
      const map = L.map('leaflet-map').setView([userLocation.lat, userLocation.lng], 12)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="user-dot"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('You are here')

      mapInstanceRef.current = map
      setMapLoaded(true)
    } catch (err) {
      console.error('Map initialization error:', err)
    }
  }

  const addStationMarkers = async () => {
    if (!mapInstanceRef.current) return
    
    const L = await import('leaflet')

    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    const availableStations = stations.filter(s => getAvailableConnectors(s) > 0)

    availableStations.forEach(station => {
      if (station.latitude && station.longitude) {
        const available = getAvailableConnectors(station)
        const total = getTotalConnectors(station)

        const stationIcon = L.divIcon({
          className: 'station-marker',
          html: `<div class="station-dot" style="background: ${available > 0 ? '#26F29F' : '#FF6B35'}">
            <span class="station-count">${available}</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const marker = L.marker([station.latitude, station.longitude], { icon: stationIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<strong>${station.name}</strong><br/>${available}/${total} available<br/>${station.operator_name}`)
          .on('click', () => calculateRoute(station))

        markersRef.current.push(marker)
      }
    })

    if (availableStations.length > 0) {
      const bounds = L.latLngBounds(
        availableStations
          .filter(s => s.latitude && s.longitude)
          .map(s => [s.latitude, s.longitude])
      )
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng])
      }
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  const calculateRoute = async (station) => {
    if (!userLocation || !station.latitude || !station.longitude) return

    setSelectedStation(station)
    setLoadingRoute(true)
    setRouteInfo(null)

    try {
      const L = await import('leaflet')
      
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current)
      }

      const dx = station.longitude - userLocation.lng
      const dy = station.latitude - userLocation.lat
      const distance = Math.sqrt(dx * dx + dy * dy) * 111
      const duration = Math.round(distance * 2)

      const routeLine = L.polyline(
        [[userLocation.lat, userLocation.lng], [station.latitude, station.longitude]],
        { color: '#00D4FF', weight: 4, opacity: 0.8, dashArray: '10, 10' }
      ).addTo(mapInstanceRef.current)

      routeLayerRef.current = routeLine

      mapInstanceRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] })

      setRouteInfo({
        distance: `${distance.toFixed(1)} km`,
        duration: `${duration} min`,
        station: station
      })
    } catch (err) {
      console.error('Route calculation error:', err)
    } finally {
      setLoadingRoute(false)
    }
  }

  const clearRoute = () => {
    if (routeLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }
    setRouteInfo(null)
    setSelectedStation(null)
  }

  const filteredStations = stations.filter(station => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      station.name.toLowerCase().includes(query) ||
      station.address?.toLowerCase().includes(query) ||
      station.operator_name?.toLowerCase().includes(query)
    )
  })

  const availableStations = filteredStations.filter(s => getAvailableConnectors(s) > 0)

  return (
    <div className="journey-page">
      <div className="journey-container">
        <div className="search-section">
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text"
              placeholder="Search charging stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button className="location-btn" onClick={getUserLocation}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="map-section">
          {!mapLoaded && (
            <div className="map-placeholder">
              <div className="map-gradient"></div>
              <div className="current-location">
                <div className="location-dot"></div>
                <span className="location-label">Loading map...</span>
              </div>
            </div>
          )}
          <div id="leaflet-map" style={{ width: '100%', height: '100%', display: mapLoaded ? 'block' : 'none' }}></div>
        </div>

        {routeInfo && (
          <div className="route-info-card">
            <div className="route-info-header">
              <h3>Route to {routeInfo.station.name}</h3>
              <button className="close-route-btn" onClick={clearRoute}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="route-stats">
              <div className="route-stat">
                <span className="stat-value">{routeInfo.distance}</span>
                <span className="stat-label">Distance</span>
              </div>
              <div className="route-stat">
                <span className="stat-value">{routeInfo.duration}</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="route-stat">
                <span className="stat-value">{getAvailableConnectors(routeInfo.station)}</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
            <Link to={`/stations/${routeInfo.station.id}`} className="btn btn-primary start-nav-btn">
              View Station Details
            </Link>
          </div>
        )}

        <div className="routes-section">
          <h2 className="section-label">NEARBY CHARGING STATIONS</h2>
          
          <div className="routes-list">
            {availableStations.length === 0 ? (
              <div className="no-stations">
                <p>No available stations found</p>
              </div>
            ) : (
              availableStations.slice(0, 5).map(station => (
                <div 
                  key={station.id} 
                  className={`route-card ${selectedStation?.id === station.id ? 'selected' : ''}`}
                  onClick={() => calculateRoute(station)}
                >
                  <div className="route-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  <div className="route-info">
                    <h3 className="route-name">{station.name}</h3>
                    <p className="route-details">
                      {getAvailableConnectors(station)}/{getTotalConnectors(station)} available · {station.operator_name}
                    </p>
                  </div>
                  {loadingRoute && selectedStation?.id === station.id ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg className="route-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  )}
                </div>
              ))
            )}
          </div>

          {!user && (
            <div className="login-prompt">
              <p>Log in to save your favorite routes</p>
              <Link to="/login" className="btn btn-primary">Log In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
