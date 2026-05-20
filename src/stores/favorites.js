import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { normalizeTrack } from '../utils/trackNormalizer.js'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(new Set())
  const favoriteVideos = ref(new Map())
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
        const vidMap = new Map()
        result.data.forEach(f => {
          if (f.video_id) vidMap.set(f.video_id, true)
        })
        favoriteVideos.value = vidMap
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
      const videoId = normalizedSong.videoId
      
      if (!videoId) {
        console.error('Cannot toggle favorite: no videoId')
        return
      }
      
      if (favoriteVideos.value.has(videoId)) {
        const songId = [...favorites.value].find(id => {
          const s = favoriteSongs.value.find(s => s.id === id)
          return s?.videoId === videoId
        }) || getSongIdByVideoId(videoId)
        
        if (!songId) return

        const result = await electron.sqlite.removeFavorite(songId)
        if (result.success) {
          favorites.value.delete(songId)
          favoriteVideos.value.delete(videoId)
          favoriteSongs.value = favoriteSongs.value.filter(s => s.videoId !== videoId)
        }
      } else {
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

        const result = await electron.sqlite.addFavorite(songId)
        if (result.success) {
          favorites.value.add(songId)
          favoriteVideos.value.set(videoId, true)
          favoriteSongs.value.unshift(normalizeTrack({
            id: songId,
            song_id: songId,
            videoId: videoId,
            video_id: videoId,
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
  
  function getSongIdByVideoId(videoId) {
    for (const f of favoriteSongs.value) {
      if (f.videoId === videoId) return f.id
    }
    return null
  }
  
  function isFavorite(songId) {
    return favorites.value.has(songId)
  }
  
  function isFavoriteByVideoId(videoId) {
    return favoriteVideos.value.has(videoId)
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
