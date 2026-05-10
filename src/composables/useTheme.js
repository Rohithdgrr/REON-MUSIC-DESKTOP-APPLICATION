import { ref, watch, onMounted } from 'vue'

const THEME_KEY = 'musicReonTheme'
const currentTheme = ref('light')

export function useTheme() {
  const isDark = ref(false)
  
  function loadTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      currentTheme.value = saved
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
    isDark.value = currentTheme.value === 'dark'
    applyTheme()
  }
  
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme.value)
  }
  
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
    isDark.value = currentTheme.value === 'dark'
    localStorage.setItem(THEME_KEY, currentTheme.value)
    applyTheme()
  }
  
  function setTheme(theme) {
    currentTheme.value = theme
    isDark.value = theme === 'dark'
    localStorage.setItem(THEME_KEY, theme)
    applyTheme()
  }
  
  // Watch for system theme changes
  onMounted(() => {
    loadTheme()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        currentTheme.value = e.matches ? 'dark' : 'light'
        isDark.value = e.matches
        applyTheme()
      }
    })
  })
  
  return {
    isDark,
    currentTheme,
    toggleTheme,
    setTheme,
    loadTheme
  }
}
