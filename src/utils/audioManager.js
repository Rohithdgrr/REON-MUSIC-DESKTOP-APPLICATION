import { Howl } from 'howler'
import { StreamMonitor } from './streamMonitor.js'

/**
 * Enhanced audio manager with retry logic, stream monitoring, crossfade, and gapless playback
 */
export class AudioManager {
  constructor() {
    this.howl = null
    this.nextHowl = null // For gapless playback
    this.monitor = new StreamMonitor()
    this.retryCount = 0
    this.maxRetries = 3
    this.callbacks = {}
    this.crossfadeDuration = 3000 // 3 seconds crossfade
    this.crossfadeEnabled = false
    this.gaplessEnabled = false
    this.isCrossfading = false
  }

  on(event, callback) {
    this.callbacks[event] = callback
  }

  emit(event, ...args) {
    if (this.callbacks[event]) {
      this.callbacks[event](...args)
    }
  }

  async load(streamUrl, options = {}) {
    this.unload()
    this.monitor.reset()

    return new Promise((resolve, reject) => {
      this.howl = new Howl({
        src: [streamUrl],
        html5: true,
        volume: options.volume || 0.8,
        format: ['webm', 'opus', 'm4a', 'mp4', 'mp3'],
        preload: true,
        xhr: {
          method: 'GET',
          headers: {
            'Range': 'bytes=0-'
          },
          withCredentials: false
        },
        onload: () => {
          this.retryCount = 0
          this.emit('load', this.howl.duration())
          resolve(this.howl)
        },
        onplay: () => {
          this.emit('play')
        },
        onpause: () => {
          this.emit('pause')
        },
        onend: () => {
          this.emit('end')
        },
        onloaderror: (_id, err) => {
          console.error('Load error:', err)
          this.emit('error', { type: 'load', error: err })
          reject(new Error(`Load error: ${err}`))
        },
        onplayerror: (_id, err) => {
          console.error('Play error:', err)
          this.emit('error', { type: 'play', error: err })
        }
      })

      if (options.autoplay) {
        this.play()
      }
    })
  }

  play() {
    if (this.howl) {
      this.howl.play()
    }
  }

  pause() {
    if (this.howl) {
      this.howl.pause()
    }
  }

  stop() {
    if (this.howl) {
      this.howl.stop()
    }
  }

  seek(time) {
    if (this.howl) {
      this.howl.seek(time)
    }
  }

  getSeek() {
    return this.howl ? this.howl.seek() : 0
  }

  setVolume(volume) {
    if (this.howl) {
      this.howl.volume(volume)
    }
  }

  duration() {
    return this.howl ? this.howl.duration() : 0
  }

  playing() {
    return this.howl ? this.howl.playing() : false
  }

  unload() {
    if (this.howl) {
      this.howl.unload()
      this.howl = null
    }
  }

  updateMonitor() {
    this.monitor.updateBufferHealth(this.howl)
  }

  getQuality() {
    return this.monitor.getQuality()
  }

  shouldRetry() {
    return this.monitor.shouldRetry()
  }

  // Crossfade settings
  setCrossfade(enabled, duration = 3000) {
    this.crossfadeEnabled = enabled
    this.crossfadeDuration = duration
  }

  // Gapless playback settings
  setGapless(enabled) {
    this.gaplessEnabled = enabled
  }

  setRate(rate) {
    if (this.howl) {
      this.howl.rate(rate)
    }
  }

  getRate() {
    return this.howl ? this.howl.rate() : 1
  }

  // Preload next track for gapless playback
  async preloadNext(streamUrl) {
    if (!this.gaplessEnabled) return

    // Unload previous preloaded track
    if (this.nextHowl) {
      this.nextHowl.unload()
      this.nextHowl = null
    }

    return new Promise((resolve, reject) => {
      this.nextHowl = new Howl({
        src: [streamUrl],
        html5: true,
        volume: 0, // Start silent
        format: ['webm', 'opus', 'm4a', 'mp4', 'mp3'],
        preload: true,
        xhr: {
          method: 'GET',
          headers: {
            'Range': 'bytes=0-'
          },
          withCredentials: false
        },
        onload: () => {
          console.log('Next track preloaded for gapless playback')
          resolve(this.nextHowl)
        },
        onloaderror: (_id, err) => {
          console.warn('Failed to preload next track:', err)
          reject(err)
        }
      })
    })
  }

  // Switch to preloaded track (gapless)
  switchToNext() {
    if (!this.nextHowl) return false

    // Stop and unload current track
    if (this.howl) {
      this.howl.stop()
      this.howl.unload()
    }

    // Switch to next track
    this.howl = this.nextHowl
    this.nextHowl = null

    // Set volume and play
    this.howl.volume(this.howl._volume || 0.8)
    this.howl.play()

    return true
  }

  // Crossfade to next track
  async crossfadeTo(nextStreamUrl, options = {}) {
    if (!this.crossfadeEnabled || this.isCrossfading) {
      // If crossfade disabled, just load normally
      return this.load(nextStreamUrl, options)
    }

    this.isCrossfading = true
    const currentHowl = this.howl
    const currentVolume = currentHowl ? currentHowl.volume() : 0

    try {
      // Load next track
      const nextHowl = new Howl({
        src: [nextStreamUrl],
        html5: true,
        volume: 0, // Start at 0 for fade in
        format: ['webm', 'opus', 'm4a', 'mp4', 'mp3'],
        preload: true,
        xhr: {
          method: 'GET',
          headers: {
            'Range': 'bytes=0-'
          },
          withCredentials: false
        }
      })

      // Wait for next track to load
      await new Promise((resolve, reject) => {
        nextHowl.once('load', resolve)
        nextHowl.once('loaderror', reject)
      })

      // Start playing next track
      nextHowl.play()

      // Perform crossfade
      const steps = 50
      const stepDuration = this.crossfadeDuration / steps
      const volumeStep = currentVolume / steps

      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration))
        
        // Fade out current
        if (currentHowl) {
          currentHowl.volume(Math.max(0, currentVolume - (volumeStep * (i + 1))))
        }
        
        // Fade in next
        nextHowl.volume(Math.min(currentVolume, volumeStep * (i + 1)))
      }

      // Clean up old track
      if (currentHowl) {
        currentHowl.stop()
        currentHowl.unload()
      }

      // Set new track as current
      this.howl = nextHowl
      this.isCrossfading = false

      // Setup callbacks for new track
      this.howl.on('play', () => this.emit('play'))
      this.howl.on('pause', () => this.emit('pause'))
      this.howl.on('end', () => this.emit('end'))
      this.howl.on('loaderror', (_id, err) => this.emit('error', { type: 'load', error: err }))
      this.howl.on('playerror', (_id, err) => this.emit('error', { type: 'play', error: err }))

      this.emit('load', this.howl.duration())
      return this.howl

    } catch (err) {
      this.isCrossfading = false
      throw err
    }
  }

  /**
   * Set up AnalyserNode for audio visualization
   * @returns {AnalyserNode|null}
   */
  setupAnalyser() {
    try {
      if (typeof Howler === 'undefined' || !Howler.ctx) return null
      if (this._analyser) return this._analyser
      
      this._analyser = Howler.ctx.createAnalyser()
      this._analyser.fftSize = 256
      Howler.masterGain.connect(this._analyser)
      return this._analyser
    } catch {
      return null
    }
  }

  getAnalyser() {
    return this._analyser || null
  }

  removeAnalyser() {
    if (this._analyser) {
      try { this._analyser.disconnect() } catch {}
      this._analyser = null
    }
  }
}
