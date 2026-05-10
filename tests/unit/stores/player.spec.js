import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '../../../src/stores/player.js'

describe('Player Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    global.window = {
      electron: {
        innertube: {
          getAudioUrl: vi.fn()
        },
        sqlite: {
          addSong: vi.fn(),
          addToHistory: vi.fn()
        }
      }
    }
    global.Howl = vi.fn(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      unload: vi.fn(),
      seek: vi.fn(),
      volume: vi.fn(),
      duration: vi.fn(() => 180),
      on: vi.fn()
    }))
  })

  it('has correct initial state', () => {
    const store = usePlayerStore()
    expect(store.currentTrack).toBeNull()
    expect(store.isPlaying).toBe(false)
    expect(store.currentTime).toBe(0)
    expect(store.duration).toBe(0)
    expect(store.volume).toBe(0.8)
    expect(store.isLoading).toBe(false)
    expect(store.queue).toEqual([])
    expect(store.currentIndex).toBe(-1)
    expect(store.repeatMode).toBe('off')
    expect(store.isShuffled).toBe(false)
  })

  it('formats time correctly', () => {
    const store = usePlayerStore()
    expect(store.formatTime(0)).toBe('0:00')
    expect(store.formatTime(65)).toBe('1:05')
    expect(store.formatTime(125)).toBe('2:05')
  })

  it('toggles shuffle mode', () => {
    const store = usePlayerStore()
    expect(store.isShuffled).toBe(false)
    store.toggleShuffle()
    expect(store.isShuffled).toBe(true)
    store.toggleShuffle()
    expect(store.isShuffled).toBe(false)
  })

  it('cycles repeat mode', () => {
    const store = usePlayerStore()
    expect(store.repeatMode).toBe('off')
    store.cycleRepeatMode()
    expect(store.repeatMode).toBe('all')
    store.cycleRepeatMode()
    expect(store.repeatMode).toBe('one')
    store.cycleRepeatMode()
    expect(store.repeatMode).toBe('off')
  })

  it('sets queue correctly', () => {
    const store = usePlayerStore()
    const tracks = [
      { videoId: 'a', title: 'Song A' },
      { videoId: 'b', title: 'Song B' }
    ]
    store.setQueue(tracks, 1)
    expect(store.queue).toEqual(tracks)
    expect(store.currentIndex).toBe(1)
  })

  it('adds tracks to queue', () => {
    const store = usePlayerStore()
    store.addToQueue({ videoId: 'a', title: 'Song A' })
    expect(store.queue).toHaveLength(1)
  })

  it('calculates progress percent', () => {
    const store = usePlayerStore()
    store.currentTime = 45
    store.duration = 180
    expect(store.progressPercent).toBe(25)
  })
})
