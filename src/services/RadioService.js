import { getElectronApi } from '../utils/electronApi.js'

/**
 * Song Radio Service - Generates similar songs based on a seed track
 */
export class RadioService {
  constructor() {
    this.cache = new Map()
  }

  /**
   * Generate a radio station based on a seed track
   * @param {Object} seedTrack - The track to base recommendations on
   * @param {number} count - Number of similar songs to fetch
   * @returns {Promise<Array>} Array of similar tracks
   */
  async generateRadio(seedTrack, count = 20) {
    if (!seedTrack || !seedTrack.videoId) {
      throw new Error('Invalid seed track')
    }

    // Check cache first
    const cacheKey = `${seedTrack.videoId}-${count}`
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 30 * 60 * 1000) { // 30 min cache
        return cached.tracks
      }
    }

    try {
      const electron = getElectronApi()
      
      // Search for similar songs using artist and genre keywords
      const searchQueries = [
        `${seedTrack.artist} similar songs`,
        `songs like ${seedTrack.title}`,
        `${seedTrack.artist} best songs`
      ]

      const allResults = []
      const seenIds = new Set([seedTrack.videoId])

      for (const query of searchQueries) {
        try {
          const result = await electron.innertube.search(query)
          if (result.success && result.data) {
            const filtered = result.data
              .filter(track => !seenIds.has(track.videoId))
              .slice(0, Math.ceil(count / searchQueries.length))
            
            filtered.forEach(track => {
              seenIds.add(track.videoId)
              allResults.push(track)
            })
          }
        } catch (err) {
          console.warn(`Failed to search for: ${query}`, err)
        }

        if (allResults.length >= count) break
      }

      // Shuffle and limit results
      const shuffled = this.shuffleArray(allResults).slice(0, count)

      // Cache results
      this.cache.set(cacheKey, {
        tracks: shuffled,
        timestamp: Date.now()
      })

      return shuffled
    } catch (err) {
      console.error('Failed to generate radio:', err)
      throw err
    }
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  shuffleArray(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear()
  }
}

export const radioService = new RadioService()
