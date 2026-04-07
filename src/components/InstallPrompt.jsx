import { useState, useEffect } from 'react'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('pwa-install-dismissed')

    if (isStandalone || dismissed) return

    if (isIOSDevice) {
      setIsIOS(true)
      setShowPrompt(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="install-prompt">
      <div className="install-content">
        <div className="install-icon">⚡</div>
        <div className="install-text">
          <h3>Install Charge Connect</h3>
          {isIOS ? (
            <p>Tap <span className="share-icon">⬆</span> then "Add to Home Screen"</p>
          ) : (
            <p>Add to your home screen for quick access</p>
          )}
        </div>
      </div>
      <div className="install-actions">
        {!isIOS && (
          <button className="install-btn" onClick={handleInstall}>
            Install
          </button>
        )}
        <button className="dismiss-btn" onClick={handleDismiss}>
          {isIOS ? 'Got it' : 'Not now'}
        </button>
      </div>
    </div>
  )
}
