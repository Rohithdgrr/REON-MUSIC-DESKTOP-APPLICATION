import { ref, computed } from 'vue'

export function useSleepTimer(playerStore) {
  const endTime = ref(null)
  const remainingSeconds = ref(0)
  const fadeOutEnabled = ref(true)
  const fadeOutDuration = 30 // seconds
  let timerInterval = null
  let fadeInterval = null
  
  const isActive = computed(() => endTime.value !== null)
  
  const remainingTime = computed(() => {
    if (!remainingSeconds.value) return '0:00'
    const hours = Math.floor(remainingSeconds.value / 3600)
    const mins = Math.floor((remainingSeconds.value % 3600) / 60)
    const secs = remainingSeconds.value % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })
  
  function setTimer(minutes) {
    if (!minutes || minutes <= 0) return
    
    endTime.value = Date.now() + (minutes * 60 * 1000)
    remainingSeconds.value = minutes * 60
    
    if (timerInterval) clearInterval(timerInterval)
    
    timerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime.value - Date.now()) / 1000))
      remainingSeconds.value = remaining
      
      // Start fade out
      if (fadeOutEnabled.value && remaining <= fadeOutDuration && remaining > 0) {
        if (!fadeInterval) {
          startFadeOut()
        }
      }
      
      // Stop playback
      if (remaining <= 0) {
        stopPlayback()
      }
    }, 1000)
  }
  
  function startFadeOut() {
    const originalVolume = playerStore.volume
    const steps = fadeOutDuration
    let currentStep = 0
    
    fadeInterval = setInterval(() => {
      currentStep++
      const newVolume = originalVolume * (1 - (currentStep / steps))
      playerStore.setVolume(Math.max(0, newVolume))
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        fadeInterval = null
      }
    }, 1000)
  }
  
  function cancelTimer() {
    endTime.value = null
    remainingSeconds.value = 0
    
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    
    if (fadeInterval) {
      clearInterval(fadeInterval)
      fadeInterval = null
    }
  }
  
  function stopPlayback() {
    if (playerStore.isPlaying) {
      playerStore.togglePlay() // Pause
    }
    cancelTimer()
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sleep Timer', {
        body: 'Playback stopped',
        icon: '/icon.png'
      })
    }
  }
  
  function toggleFadeOut() {
    fadeOutEnabled.value = !fadeOutEnabled.value
  }
  
  return {
    isActive,
    remainingTime,
    remainingSeconds,
    fadeOutEnabled,
    setTimer,
    cancelTimer,
    toggleFadeOut
  }
}
