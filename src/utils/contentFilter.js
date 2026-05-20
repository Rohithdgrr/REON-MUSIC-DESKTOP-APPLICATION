const NON_MUSIC_KEYWORDS = [
  'podcast', 'podcast episode', 'episode', 'audiobook', 'audio book',
  'interview', 'talk show', 'debate', 'lecture', 'speech',
  'documentary', 'vlog', 'tutorial', 'review', 'reaction',
  'gameplay', 'stream', 'live stream', 'asmr', 'meditation',
  'guided meditation', 'white noise', 'rain sounds', 'nature sounds',
  'sleep music', 'sleep sounds', 'ambient noise', 'frequency',
  'binaural beats', 'affirmation', 'hypnosis', 'subliminal',
  'podcasts', 'episodio', 'entrevista', 'podkast'
]

const AUDIOBOOK_LENGTH = 1800 // 30 minutes
const PODCAST_LENGTH = 1200 // 20 minutes

export function isMusicContent(track) {
  if (!track) return false

  const title = (track.title || '').toLowerCase().trim()
  const artist = (track.artist || '').toLowerCase().trim()
  const duration = track.duration || 0

  const combinedText = `${title} ${artist}`

  const hasNonMusicKeyword = NON_MUSIC_KEYWORDS.some(keyword =>
    combinedText.includes(keyword)
  )

  if (hasNonMusicKeyword) return false

  if (duration > AUDIOBOOK_LENGTH) {
    const musicLongFormKeywords = [
      'live concert', 'live set', 'live performance', 'dj mix', 'dj set',
      'full album', 'album stream', 'mixtape', 'megamix', 'mashup',
      'orchestra', 'symphony', 'full show', 'full concert',
      'continuous mix', 'studio session', 'live session',
      'lofi mix', 'chill mix', 'workout music', 'study music',
      'relaxing music', 'instrumental', 'classical music',
      'jazz', 'blues', 'ambient music', 'focus music'
    ]
    const isMusicLongForm = musicLongFormKeywords.some(keyword =>
      title.includes(keyword)
    )
    if (!isMusicLongForm) return false
  }

  return true
}

export function filterMusicContent(tracks) {
  if (!tracks || !Array.isArray(tracks)) return []
  return tracks.filter(isMusicContent)
}

export function classifyContentType(track) {
  if (!track) return 'unknown'

  const title = (track.title || '').toLowerCase()
  const duration = track.duration || 0
  const artist = (track.artist || '').toLowerCase()

  if (title.includes('dj mix') || title.includes('dj set') ||
      title.includes('continuous mix') || title.includes('megamix')) {
    return 'dj-mix'
  }

  if (title.includes('live concert') || title.includes('live performance') ||
      title.includes('live set') || title.includes('full concert') ||
      title.includes('live session')) {
    return 'live-performance'
  }

  if (duration > AUDIOBOOK_LENGTH && !title.includes('full album')) {
    const podcastHints = ['episode', 'podcast', 'interview', 'talk']
    if (podcastHints.some(h => title.includes(h))) {
      return 'podcast'
    }
    return 'long-form'
  }

  if (duration < 60) return 'short-clip'

  return 'song'
}
