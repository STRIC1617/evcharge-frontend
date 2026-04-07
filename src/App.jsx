import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Stations from './pages/Stations'
import StationDetail from './pages/StationDetail'
import Bookings from './pages/Bookings'
import Sessions from './pages/Sessions'
import Billing from './pages/Billing'
import Journey from './pages/Journey'
import Charge from './pages/Charge'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Privacy from './pages/Privacy'
import Help from './pages/Help'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import InstallPrompt from './components/InstallPrompt'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/stations" element={<Stations />} />
      <Route path="/stations/:id" element={<StationDetail />} />
      <Route path="/journey" element={<Journey />} />
      <Route path="/charge" element={<Charge />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="app">
            <main className="main-content">
              <AppRoutes />
            </main>
            <BottomNav />
            <InstallPrompt />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
