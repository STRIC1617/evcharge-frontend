import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const colorSchemes = {
  volt: {
    primary: '#00D4FF',
    primaryStrong: '#00A8CC',
    primarySoft: '#0A3D4D',
    primaryGlow: 'rgba(0, 212, 255, 0.2)',
    accent: '#26F29F',
    accentGlow: 'rgba(38, 242, 159, 0.2)',
    success: '#26F29F',
    successBg: '#0D3D2D',
  },
  eco: {
    primary: '#26F29F',
    primaryStrong: '#0CCE6B',
    primarySoft: '#144F2F',
    primaryGlow: 'rgba(38, 242, 159, 0.2)',
    accent: '#00D4FF',
    accentGlow: 'rgba(0, 212, 255, 0.2)',
    success: '#26F29F',
    successBg: '#0D3D2D',
  },
  inferno: {
    primary: '#FF6B35',
    primaryStrong: '#E85A24',
    primarySoft: '#4D2A1A',
    primaryGlow: 'rgba(255, 107, 53, 0.2)',
    accent: '#FFB347',
    accentGlow: 'rgba(255, 179, 71, 0.2)',
    success: '#FFB347',
    successBg: '#3D3014',
  },
  neon: {
    primary: '#B64CFF',
    primaryStrong: '#9933FF',
    primarySoft: '#3D1A4D',
    primaryGlow: 'rgba(182, 76, 255, 0.2)',
    accent: '#FF6BE6',
    accentGlow: 'rgba(255, 107, 230, 0.2)',
    success: '#FF6BE6',
    successBg: '#3D1A3D',
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('charge-theme')
    if (saved) return saved
    return 'dark'
  })

  const [colorScheme, setColorScheme] = useState(() => {
    const saved = localStorage.getItem('charge-color-scheme')
    return saved || 'volt'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('charge-theme', theme)
  }, [theme])

  useEffect(() => {
    const scheme = colorSchemes[colorScheme]
    if (scheme) {
      document.documentElement.style.setProperty('--primary', scheme.primary)
      document.documentElement.style.setProperty('--primary-strong', scheme.primaryStrong)
      document.documentElement.style.setProperty('--primary-soft', scheme.primarySoft)
      document.documentElement.style.setProperty('--primary-glow', scheme.primaryGlow)
      document.documentElement.style.setProperty('--accent', scheme.accent)
      document.documentElement.style.setProperty('--accent-glow', scheme.accentGlow)
      document.documentElement.style.setProperty('--success', scheme.success)
      document.documentElement.style.setProperty('--success-bg', scheme.successBg)
    }
    localStorage.setItem('charge-color-scheme', colorScheme)
  }, [colorScheme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setThemeMode = (mode) => {
    setTheme(mode)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setThemeMode,
      colorScheme, 
      setColorScheme,
      colorSchemes: Object.keys(colorSchemes)
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
