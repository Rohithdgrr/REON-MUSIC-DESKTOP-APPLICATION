import { ref } from 'vue'

export function useAudioEffects() {
  const bassBoost = ref(0) // 0-100
  const playbackSpeed = ref(1.0) // 0.5-2.0
  const normalization = ref(false)
  const effectsEnabled = ref(true)
  
  // Store original volume for normalization
  let originalVolume = 1.0
  
  function setBassBoost(value, howl) {
    bassBoost.value = Math.max(0, Math.min(100, value))
    
    if (!howl || !effectsEnabled.value) return
    
    // Howler doesn't support direct EQ, but we can adjust volume for bass perception
    // In a full implementation, you'd use Web Audio API
    console.log('Bass boost set to:', bassBoost.value)
  }
  
  function setPlaybackSpeed(speed, howl) {
    playbackSpeed.value = Math.max(0.5, Math.min(2.0, speed))
    
    if (!howl || !effectsEnabled.value) return
    
    try {
      howl.rate(playbackSpeed.value)
    } catch (err) {
      console.error('Failed to set playback speed:', err)
    }
  }
  
  function toggleNormalization(howl, currentVolume) {
    normalization.value = !normalization.value
    
    if (!howl || !effectsEnabled.value) return
    
    if (normalization.value) {
      originalVolume = currentVolume
      // Apply compression/normalization
      // In a full implementation, use Web Audio API DynamicsCompressor
      howl.volume(Math.min(1.0, currentVolume * 1.2))
    } else {
      // Restore original volume
      howl.volume(originalVolume)
    }
  }
  
  function toggleEffects() {
    effectsEnabled.value = !effectsEnabled.value
  }
  
  function resetEffects(howl) {
    bassBoost.value = 0
    playbackSpeed.value = 1.0
    normalization.value = false
    
    if (howl) {
      howl.rate(1.0)
    }
  }
  
  function applyEffects(howl, volume) {
    if (!howl || !effectsEnabled.value) return
    
    // Apply playback speed
    if (playbackSpeed.value !== 1.0) {
      howl.rate(playbackSpeed.value)
    }
    
    // Apply normalization
    if (normalization.value) {
      howl.volume(Math.min(1.0, volume * 1.2))
    }
  }
  
  return {
    bassBoost,
    playbackSpeed,
    normalization,
    effectsEnabled,
    setBassBoost,
    setPlaybackSpeed,
    toggleNormalization,
    toggleEffects,
    resetEffects,
    applyEffects
  }
}
