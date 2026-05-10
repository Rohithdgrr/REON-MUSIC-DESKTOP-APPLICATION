/**
 * Stream quality monitor for adaptive streaming
 */
export class StreamMonitor {
  constructor() {
    this.bufferHealth = 100
    this.stallCount = 0
    this.lastUpdateTime = Date.now()
  }

  updateBufferHealth(howl) {
    if (!howl) return

    const now = Date.now()
    const timeSinceUpdate = now - this.lastUpdateTime

    // Check if playback is stalling
    if (timeSinceUpdate > 1000 && howl.playing()) {
      this.stallCount++
      this.bufferHealth = Math.max(0, this.bufferHealth - 10)
    } else if (this.bufferHealth < 100) {
      // Recover buffer health slowly
      this.bufferHealth = Math.min(100, this.bufferHealth + 5)
    }

    this.lastUpdateTime = now
  }

  shouldRetry() {
    return this.bufferHealth < 30 || this.stallCount > 3
  }

  reset() {
    this.bufferHealth = 100
    this.stallCount = 0
    this.lastUpdateTime = Date.now()
  }

  getQuality() {
    if (this.bufferHealth > 70) return 'good'
    if (this.bufferHealth > 40) return 'fair'
    return 'poor'
  }
}
