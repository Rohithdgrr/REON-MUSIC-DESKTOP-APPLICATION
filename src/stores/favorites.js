import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { normalizeTrack } from '../utils/trackNormalizer.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(new Set())
  const favoriteSongs = ref([])
  const isLoaded = ref(false)
  
  const favoriteCount = computed(() => favorites.value.size)
  
  async function loadFavorites(force = false) {
    if (isLoaded.value && !force) {
      return favoriteSongs.value
    }

    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.getFavorites()
      
      if (result.success) {
        favorites.value = new Set(result.data.map(f => f.song_id))
        favoriteSongs.value = result.data.map(f => normalizeTrack({
          id: f.song_id,
          song_id: f.song_id,
          videoId: f.video_id,
          video_id: f.video_id,
          title: f.title,
          artist: f.artist,
          thumbnail: f.thumbnail_url,
          duration: f.duration_seconds,
          addedAt: f.added_at,
          added_at: f.added_at
        }))
        isLoaded.value = true
      }
    } catch (err) {
      console.error('Failed to load favorites:', err)
    }
  }
  
  async function toggleFavorite(song) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const normalizedSong = normalizeTrack(song)
      
      // Ensure song is in library first
      const addResult = await electron.sqlite.addSong({
        videoId: normalizedSong.videoId,
        title: normalizedSong.title,
        artist: normalizedSong.artist,
        thumbnail: normalizedSong.thumbnail || '',
        duration: normalizedSong.duration || 0
      })
      
      if (!addResult.success) {
        throw new Error('Failed to add song to library')
      }
      
      const songId = addResult.data.id
      
      if (favorites.value.has(songId)) {
        // Remove from favorites
        const result = await electron.sqlite.removeFavorite(songId)
        if (result.success) {
          favorites.value.delete(songId)
          favoriteSongs.value = favoriteSongs.value.filter(s => s.id !== songId)
        }
      } else {
        // Add to favorites
        const result = await electron.sqlite.addFavorite(songId)
        if (result.success) {
          favorites.value.add(songId)
          favoriteSongs.value.unshift(normalizeTrack({
            id: songId,
            song_id: songId,
            videoId: normalizedSong.videoId,
            video_id: normalizedSong.videoId,
            title: normalizedSong.title,
            artist: normalizedSong.artist,
            thumbnail: normalizedSong.thumbnail,
            duration: normalizedSong.duration,
            addedAt: new Date().toISOString()
          }))
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    }
  }
  
  function isFavorite(songId) {
    return favorites.value.has(songId)
  }
  
  function isFavoriteByVideoId(videoId) {
    return favoriteSongs.value.some(s => s.videoId === videoId)
  }
  
  return {
    favorites,
    favoriteSongs,
    favoriteCount,
    isLoaded,
    loadFavorites,
    toggleFavorite,
    isFavorite,
    isFavoriteByVideoId
  }
})
