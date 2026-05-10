import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AudioManager } from '../utils/audioManager.js'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'

export const usePlayerStore = defineStore('player', () => {
  // State
  const currentTrack = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const isLoading = ref(false)
  const queue = ref([])
  const currentIndex = ref(-1)
  const repeatMode = ref('off') // 'off', 'all', 'one'
  const isShuffled = ref(false)
  const error = ref(null)

  const audioManager = new AudioManager()
  let progressTimer = null
  let urlCache = new Map() // Cache URLs with expiry
  let retryCount = 0
  const MAX_RETRIES = 3

  // Getters
  const hasNext = computed(() => {
    if (isShuffled.value) return queue.value.length > 1
    return currentIndex.value < queue.value.length - 1
  })

  const hasPrevious = computed(() => {
    if (isShuffled.value) return queue.value.length > 1
    return currentIndex.value > 0
  })

  const progressPercent = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  // Setup audio manager callbacks
  audioManager.on('load', (dur) => {
    isLoading.value = false
    duration.value = dur
    retryCount = 0
    console.log('Audio loaded successfully, duration:', dur)
  })

  audioManager.on('play', () => {
    isPlaying.value = true
    startProgressTimer()
  })

  audioManager.on('pause', () => {
    isPlaying.value = false
    stopProgressTimer()
  })

  audioManager.on('end', () => {
    handleTrackEnd()
  })

  audioManager.on('error', async ({ type, error: err }) => {
    await handleStreamError(type, err)
  })

  // Actions
  async function initAudio(streamUrl, autoplay = true) {
    isLoading.value = true
    error.value = null

    try {
      await audioManager.load(streamUrl, {
        volume: volume.value,
        autoplay
      })
    } catch (err) {
      console.error('Failed to initialize audio:', err)
      await handleStreamError('load', err)
    }
  }

  async function handleStreamError(type, err) {
    isLoading.value = false
    
    try {
      await waitForElectronApi()
    } catch (apiErr) {
      error.value = 'Audio system not ready'
      console.error('Electron API not available:', apiErr)
      return
    }
    
    if (retryCount < MAX_RETRIES && currentTrack.value) {
      retryCount++
      error.value = `Retrying... (${retryCount}/${MAX_RETRIES})`
      console.log(`Retry attempt ${retryCount} for ${currentTrack.value.videoId}`)
      
      // Clear cached URL and retry
      urlCache.delete(currentTrack.value.videoId)
      
      setTimeout(async () => {
        try {
          const electron = getElectronApi()
          const result = await electron.innertube.getAudioUrl(currentTrack.value.videoId)
          if (result.success) {
            await initAudio(result.data)
          } else {
            throw new Error(result.error)
          }
        } catch (retryErr) {
          if (retryCount >= MAX_RETRIES) {
            error.value = `Failed to ${type} audio after ${MAX_RETRIES} attempts`
            retryCount = 0
          }
        }
      }, 1000 * retryCount) // Exponential backoff
    } else {
      error.value = `Failed to ${type} audio: ${err}`
      retryCount = 0
    }
  }

  async function playTrack(track) {
    try {
      if (!track || !track.videoId) {
        error.value = 'Invalid track'
        return
      }

      // Wait for electron API to be ready
      await waitForElectronApi()
      const electron = getElectronApi()

      // Check if already playing this track
      if (currentTrack.value?.videoId === track.videoId && audioManager.howl) {
        togglePlay()
        return
      }

      currentTrack.value = track
      retryCount = 0

      // Check cache first
      const cached = urlCache.get(track.videoId)
      const now = Date.now()
      
      let streamUrl
      if (cached && (now - cached.timestamp) < 5 * 60 * 60 * 1000) { // 5 hour cache
        console.log('Using cached URL for', track.videoId)
        streamUrl = cached.url
      } else {
        const result = await electron.innertube.getAudioUrl(track.videoId)
        if (!result.success) {
          throw new Error(result.error || 'Failed to get audio URL')
        }
        streamUrl = result.data
        
        // Cache the URL
        urlCache.set(track.videoId, {
          url: streamUrl,
          timestamp: now
        })
      }

      initAudio(streamUrl)

      // Preload next track in queue
      preloadNextTrack()

      // Add to library and history
      try {
        const addResult = await electron.sqlite.addSong({
          videoId: track.videoId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail || '',
          duration: track.duration || 0
        })
        if (addResult.success && addResult.data?.id) {
          await electron.sqlite.addToHistory(addResult.data.id)
        }
      } catch (e) {
        console.warn('Failed to save to library/history:', e)
      }
    } catch (err) {
      isLoading.value = false
      error.value = err.message || 'Failed to play track'
      console.error('playTrack error:', err)
    }
  }

  async function preloadNextTrack() {
    if (!hasNext.value) return
    
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const nextIndex = isShuffled.value 
        ? Math.floor(Math.random() * queue.value.length)
        : currentIndex.value + 1
      
      const nextTrack = queue.value[nextIndex]
      if (!nextTrack) return

      // Check if already cached
      const cached = urlCache.get(nextTrack.videoId)
      const now = Date.now()
      
      if (!cached || (now - cached.timestamp) >= 5 * 60 * 60 * 1000) {
        console.log('Preloading next track:', nextTrack.title)
        const result = await electron.innertube.getAudioUrl(nextTrack.videoId)
        if (result.success) {
          urlCache.set(nextTrack.videoId, {
            url: result.data,
            timestamp: now
          })
        }
      }
    } catch (err) {
      console.warn('Failed to preload next track:', err)
    }
  }

  function togglePlay() {
    if (!audioManager.howl) return
    if (isPlaying.value) {
      audioManager.pause()
    } else {
      audioManager.play()
    }
  }

  function seekTo(percent) {
    if (!audioManager.howl || !duration.value) return
    const time = (percent / 100) * duration.value
    
    try {
      audioManager.seek(time)
      currentTime.value = time
      
      // Clear error on successful seek
      if (error.value && error.value.includes('Retrying')) {
        error.value = null
      }
    } catch (err) {
      console.error('Seek error:', err)
      error.value = 'Failed to seek'
    }
  }

  function setVolume(val) {
    volume.value = val
    audioManager.setVolume(val)
  }

  function playNext() {
    if (!hasNext.value) return

    if (isShuffled.value) {
      const nextIndex = Math.floor(Math.random() * queue.value.length)
      currentIndex.value = nextIndex
    } else {
      currentIndex.value++
    }

    const nextTrack = queue.value[currentIndex.value]
    if (nextTrack) {
      playTrack(nextTrack)
    }
  }

  function playPrevious() {
    if (!hasPrevious.value) return

    if (currentTime.value > 5) {
      // Restart current track if more than 5 seconds in
      seekTo(0)
      return
    }

    if (isShuffled.value) {
      const prevIndex = Math.floor(Math.random() * queue.value.length)
      currentIndex.value = prevIndex
    } else {
      currentIndex.value--
    }

    const prevTrack = queue.value[currentIndex.value]
    if (prevTrack) {
      playTrack(prevTrack)
    }
  }

  function handleTrackEnd() {
    if (repeatMode.value === 'one') {
      seekTo(0)
      audioManager.play()
    } else if (repeatMode.value === 'all' || hasNext.value) {
      playNext()
    } else {
      isPlaying.value = false
      currentTime.value = 0
    }
  }

  function setQueue(tracks, startIndex = 0) {
    queue.value = [...tracks]
    currentIndex.value = startIndex
  }

  function addToQueue(track) {
    queue.value.push(track)
  }

  function clearQueue() {
    queue.value = []
    currentIndex.value = -1
  }

  function toggleShuffle() {
    isShuffled.value = !isShuffled.value
  }

  function cycleRepeatMode() {
    const modes = ['off', 'all', 'one']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
  }

  // Progress timer
  function startProgressTimer() {
    stopProgressTimer()
    progressTimer = setInterval(() => {
      if (audioManager.playing()) {
        const newTime = audioManager.getSeek()
        // Only update if changed to avoid unnecessary reactivity
        if (Math.abs(newTime - currentTime.value) > 0.1) {
          currentTime.value = newTime
        }
        
        // Monitor stream quality
        audioManager.updateMonitor()
      }
    }, 100) // Update more frequently for smoother progress
  }

  function stopProgressTimer() {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  function cleanup() {
    audioManager.unload()
    stopProgressTimer()
    urlCache.clear()
  }

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    queue,
    currentIndex,
    repeatMode,
    isShuffled,
    error,
    hasNext,
    hasPrevious,
    progressPercent,
    playTrack,
    togglePlay,
    seekTo,
    setVolume,
    playNext,
    playPrevious,
    setQueue,
    addToQueue,
    clearQueue,
    toggleShuffle,
    cycleRepeatMode,
    formatTime,
    cleanup
  }
})
