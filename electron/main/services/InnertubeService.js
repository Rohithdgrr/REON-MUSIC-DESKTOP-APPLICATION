import { Innertube } from 'youtubei.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import log from 'electron-log'

const execAsync = promisify(exec)

class InnertubeService {
  constructor() {
    this.yt = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return
    try {
      this.yt = await Innertube.create()
      this.initialized = true
      log.info('Innertube client initialized')
    } catch (err) {
      log.error('Failed to initialize Innertube:', err.message)
      throw err
    }
  }

  async search(query, options = {}) {
    await this.init()
    try {
      const results = await this.yt.search(query, {
        type: options.type || 'video',
        ...options
      })
      return this.normalizeSearchResults(results)
    } catch (err) {
      log.error('Search failed:', err.message)
      throw err
    }
  }

  async getAudioUrl(videoId) {
    await this.init()
    
    // Try Innertube first (faster), fallback to yt-dlp
    try {
      return await this.getAudioUrlViaInnertube(videoId)
    } catch (err) {
      log.warn(`Innertube failed for ${videoId}, trying yt-dlp:`, err.message)
      return await this.getAudioUrlViaYtDlp(videoId)
    }
  }

  async getAudioUrlViaInnertube(videoId) {
    try {
      const info = await this.yt.getBasicInfo(videoId)
      
      // Get adaptive formats (audio only)
      const formats = info.streaming_data?.adaptive_formats || []
      
      // Prioritize opus/webm for better streaming, then m4a/mp4
      const audioFormats = formats
        .filter(f => f.has_audio && !f.has_video)
        .sort((a, b) => {
          // Prefer opus codec
          if (a.mime_type?.includes('opus') && !b.mime_type?.includes('opus')) return -1
          if (!a.mime_type?.includes('opus') && b.mime_type?.includes('opus')) return 1
          // Then prefer higher bitrate
          return (b.bitrate || 0) - (a.bitrate || 0)
        })

      if (audioFormats.length === 0) {
        throw new Error('No audio formats available')
      }

      const bestFormat = audioFormats[0]
      const streamUrl = bestFormat.decipher(this.yt.session.player)
      
      log.info(`Audio URL extracted via Innertube for ${videoId} (${bestFormat.mime_type})`)
      return streamUrl
    } catch (err) {
      log.error(`Innertube audio extraction failed for ${videoId}:`, err.message)
      throw err
    }
  }

  async getAudioUrlViaYtDlp(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`
    // Prefer opus/webm for streaming, fallback to m4a
    const cmd = `py -m yt_dlp --no-warnings -f "bestaudio[ext=webm]/bestaudio[ext=m4a]/bestaudio" -g "${url}"`

    try {
      const { stdout, stderr } = await execAsync(cmd, { timeout: 15000 })
      if (stderr) {
        log.warn('yt-dlp stderr:', stderr)
      }
      const lines = stdout.trim().split('\n').filter(line => line.startsWith('http'))
      if (lines.length === 0) {
        throw new Error('yt-dlp returned no audio URL')
      }
      log.info(`Audio URL extracted via yt-dlp for ${videoId}`)
      return lines[0].trim()
    } catch (err) {
      log.error(`yt-dlp failed for ${videoId}:`, err.message)
      throw new Error(`Failed to extract audio URL: ${err.message}`)
    }
  }

  async getVideoInfo(videoId) {
    await this.init()
    try {
      const info = await this.yt.getBasicInfo(videoId)
      const details = info.basic_info
      return {
        videoId: details.id,
        title: details.title || 'Unknown Title',
        artist: details.author || 'Unknown Artist',
        thumbnail: details.thumbnail?.[0]?.url || '',
        duration: details.duration || 0
      }
    } catch (err) {
      log.error(`Failed to get video info for ${videoId}:`, err.message)
      throw err
    }
  }

  normalizeSearchResults(results) {
    if (!results || !results.results) {
      return []
    }

    return results.results
      .filter(item => item.type === 'Video' || item.type === 'Movie')
      .map(item => ({
        videoId: item.id,
        title: item.title?.text || 'Unknown',
        artist: item.author?.name || 'Unknown Artist',
        thumbnail: item.thumbnails?.[0]?.url || '',
        duration: item.duration?.seconds || 0,
        viewCount: item.view_count?.text || ''
      }))
      .slice(0, 20)
  }
}

export const innertubeService = new InnertubeService()
