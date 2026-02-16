import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { NuiEvent } from "../hooks/NuiEvent"
import { nuicallback } from "../utils/nuicallback"

const ThemeCtx = createContext(null)

// CSS link element ID
const THEME_CSS_ID = 'nox-external-theme-css'

// Default theme color definitions
export const defaultThemes = {
  dark: {
    background: "rgba(0, 0, 0, 0.7)",
    backgroundLight: "rgba(0, 0, 0, 0.5)",
    backgroundSolid: "rgba(30, 30, 30, 0.9)",
    text: "#ffffff",
    textSecondary: "rgba(255, 255, 255, 0.7)",
    border: "rgba(255, 255, 255, 0.1)",
    accent: "#f93639",
    cardBg: "rgba(0, 0, 0, 0.6)",
    headerBg: "#D7D7D7",
    headerText: "rgba(0, 0, 0, 0.8)",
    statusBg: "rgba(0, 0, 0, 0.6)",
    iconInactive: "rgba(255, 255, 255, 0.4)",
  },
  light: {
    background: "rgba(255, 255, 255, 0.85)",
    backgroundLight: "rgba(255, 255, 255, 0.7)",
    backgroundSolid: "rgba(245, 245, 245, 0.95)",
    text: "#1a1a1a",
    textSecondary: "rgba(0, 0, 0, 0.6)",
    border: "rgba(0, 0, 0, 0.1)",
    accent: "#f93639",
    cardBg: "rgba(255, 255, 255, 0.8)",
    headerBg: "#3a3a3a",
    headerText: "rgba(255, 255, 255, 0.9)",
    statusBg: "rgba(255, 255, 255, 0.8)",
    iconInactive: "rgba(0, 0, 0, 0.3)",
  }
}

// themes export for backward compatibility
export const themes = defaultThemes

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true)
  
  // Registered external theme list
  const [registeredThemes, setRegisteredThemes] = useState([])
  const [currentThemeId, setCurrentThemeId] = useState('default')
  const [currentExternalTheme, setCurrentExternalTheme] = useState(null)
  
  // Hidden components (components replaced by external theme)
  const [hiddenComponents, setHiddenComponents] = useState({})
  
  // Check if component is hidden
  const isComponentHidden = useCallback((componentName) => {
    return hiddenComponents[componentName] === true
  }, [hiddenComponents])
  
  // Calculate current theme colors
  const getThemeColors = useCallback(() => {
    // Apply if external theme exists and has custom colors
    if (currentExternalTheme?.colors) {
      const baseTheme = isDark ? defaultThemes.dark : defaultThemes.light
      return {
        ...baseTheme,
        accent: currentExternalTheme.colors.primary || baseTheme.accent,
        // External theme colors can be additionally applied
      }
    }
    return isDark ? defaultThemes.dark : defaultThemes.light
  }, [isDark, currentExternalTheme])
  
  const theme = getThemeColors()

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const setTheme = (dark) => {
    setIsDark(dark)
  }
  
  // Select external theme
  const selectExternalTheme = useCallback((themeId) => {
    nuicallback('selectTheme', { themeId }).then((response) => {
      if (response?.success) {
        // Re-request list after theme selection
        requestThemeList()
      }
    })
  }, [])
  
  // Request theme list
  const requestThemeList = useCallback(() => {
    nuicallback('getThemeList', {}).then((data) => {
      if (data?.themes) {
        setRegisteredThemes(data.themes)
        setCurrentThemeId(data.currentTheme || 'default')
        
        const selected = data.themes.find(t => t.id === data.currentTheme)
        setCurrentExternalTheme(selected || null)
      }
      if (data?.hiddenComponents) {
        setHiddenComponents(data.hiddenComponents)
      }
    })
  }, [])
  
  // Request theme list on app start
  useEffect(() => {
    // Request theme list after brief delay (wait for Lua init)
    const timer = setTimeout(() => {
      requestThemeList()
    }, 500)
    return () => clearTimeout(timer)
  }, [requestThemeList])

  // NUI event: receive theme list
  const handleThemeList = (data) => {
    if (data?.themes) {
      setRegisteredThemes(data.themes)
      setCurrentThemeId(data.currentTheme || 'default')
      
      // Find currently selected theme info
      const selected = data.themes.find(t => t.id === data.currentTheme)
      setCurrentExternalTheme(selected || null)
    }
    if (data?.hiddenComponents) {
      setHiddenComponents(data.hiddenComponents)
    }
  }
  NuiEvent("themeList", handleThemeList)
  
  // NUI event: theme selected
  const handleThemeSelected = (data) => {
    if (data?.theme) {
      setCurrentThemeId(data.theme.id)
      setCurrentExternalTheme(data.theme)
    }
    if (data?.hiddenComponents) {
      setHiddenComponents(data.hiddenComponents)
    }
  }
  NuiEvent("themeSelected", handleThemeSelected)
  
  // NUI event: theme override (hide components)
  const handleThemeOverrides = (data) => {
    if (data?.hiddenComponents) {
      setHiddenComponents(data.hiddenComponents)
    }
  }
  NuiEvent("themeOverrides", handleThemeOverrides)
  
  // Dynamic CSS load/unload
  useEffect(() => {
    // Remove existing theme CSS
    const existingLink = document.getElementById(THEME_CSS_ID)
    if (existingLink) {
      existingLink.remove()
    }
    
    // Load if external theme exists and has cssUrl
    if (currentExternalTheme?.cssUrl) {
      const link = document.createElement('link')
      link.id = THEME_CSS_ID
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = currentExternalTheme.cssUrl
      link.setAttribute('data-theme-id', currentExternalTheme.id)
      document.head.appendChild(link)
      
      console.log('[nc-hud] Theme CSS loaded:', currentExternalTheme.cssUrl)
    }
    
    // Set theme ID as data attribute on body
    document.body.setAttribute('data-nox-theme', currentThemeId)
    
    return () => {
      // cleanup
    }
  }, [currentExternalTheme, currentThemeId])

  // Receive theme settings via NUI event
  const handleThemeChange = (data) => {
    if (data && typeof data.darkmode !== 'undefined') {
      setIsDark(data.darkmode)
    }
  }
  NuiEvent("themechange", handleThemeChange)

  // Apply theme when loading settings
  const handleLoadSettings = (data) => {
    if (data && typeof data.darkmode !== 'undefined') {
      setIsDark(data.darkmode)
    }
  }
  NuiEvent("loadSettings", handleLoadSettings)

  // Settings received from settings window
  const handleSettings = (data) => {
    if (data && typeof data.darkmode !== 'undefined') {
      setIsDark(data.darkmode)
    }
  }
  NuiEvent("settings", handleSettings)

  return (
    <ThemeCtx.Provider value={{ 
      isDark, 
      theme, 
      toggleTheme, 
      setTheme,
      // External theme related
      registeredThemes,
      currentThemeId,
      currentExternalTheme,
      selectExternalTheme,
      requestThemeList,
      // Component hiding related
      hiddenComponents,
      isComponentHidden,
    }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export default ThemeProvider

export const useTheme = () => useContext(ThemeCtx)
