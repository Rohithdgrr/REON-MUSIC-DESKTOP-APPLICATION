export function normalizeTrack(track = {}) {
  return {
    id: track.id ?? track.song_id ?? track.songId ?? null,
    videoId: track.videoId ?? track.video_id ?? '',
    title: track.title || 'Unknown',
    artist: track.artist || 'Unknown',
    thumbnail: track.thumbnail || track.thumbnail_url || '',
    duration: track.duration || track.duration_seconds || 0,
    addedAt: track.addedAt || track.added_at || null
  }
}

export function normalizeTrackList(tracks = []) {
  return Array.isArray(tracks) ? tracks.map(normalizeTrack).filter(track => track.videoId || track.id) : []
}

export function trackIdentity(track = {}) {
  return track.videoId || track.video_id || track.id || track.song_id || ''
}