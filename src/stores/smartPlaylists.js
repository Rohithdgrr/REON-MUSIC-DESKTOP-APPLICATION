import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLibraryStore } from './library.js'
import { useFavoritesStore } from './favorites.js'
import { filterMusicContent } from '../utils/contentFilter.js'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'

export const useSmartPlaylistsStore = defineStore('smartPlaylists', () => {
  const libraryStore = useLibraryStore()
  const favoritesStore = useFavoritesStore()

  const smartPlaylists = ref([
    {
      id: 'recently-added',
      name: 'Recently Added',
      description: 'Songs added in the last 7 days',
      rule: 'recentlyAdded'
    },
    {
      id: 'most-played',
      name: 'Most Played',
      description: 'Your top 50 most played songs',
      rule: 'mostPlayed'
    },
    {
      id: 'favorites-mix',
      name: 'Favorites Mix',
      description: 'All your favorite songs',
      rule: 'favorites'
    },
    {
      id: 'long-songs',
      name: 'Long Songs',
      description: 'Songs longer than 5 minutes',
      rule: 'longDuration'
    },
    {
      id: 'short-songs',
      name: 'Short Songs',
      description: 'Songs shorter than 3 minutes',
      rule: 'shortDuration'
    }
  ])

  const moodPlaylists = ref([
    { id: 'workout', name: 'Workout 💪', description: 'High energy to power your workout', query: 'workout songs 2024 high energy' },
    { id: 'focus', name: 'Focus 🎯', description: 'Deep concentration and productivity', query: 'focus music instrumental study' },
    { id: 'chill', name: 'Chill 😎', description: 'Relaxed vibes to wind down', query: 'chill songs relax 2024' },
    { id: 'party', name: 'Party 🎉', description: 'Upbeat tracks for the party', query: 'party songs dance 2024 bollywood' },
    { id: 'romantic', name: 'Romantic 💕', description: 'Love songs for the mood', query: 'romantic love songs 2024' },
    { id: 'road-trip', name: 'Road Trip 🚗', description: 'Sing-along tracks for the journey', query: 'road trip songs hindi 2024' },
    { id: 'sad', name: 'Sad 🥺', description: 'Emotional ballads and heartbreak songs', query: 'sad songs heartbreak emotional' },
    { id: 'morning', name: 'Morning ☀️', description: 'Fresh start to your day', query: 'morning songs positive energy' },
    { id: 'night', name: 'Night 🌙', description: 'Late night wind down', query: 'night songs calm relaxing' },
    { id: 'devotional', name: 'Devotional 🙏', description: 'Spiritual and devotional music', query: 'devotional songs bhajans' }
  ])

  const moodResults = ref({})
  const isLoadingMood = ref(false)

  function generatePlaylist(playlistId) {
    const playlist = smartPlaylists.value.find(p => p.id === playlistId)
    if (!playlist) return []

    const allSongs = libraryStore.songs
    const history = libraryStore.history
    const favorites = favoritesStore.favorites

    switch (playlist.rule) {
      case 'recentlyAdded': {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        return allSongs
          .filter(song => song.addedAt && new Date(song.addedAt).getTime() > sevenDaysAgo)
          .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      }

      case 'mostPlayed': {
        const playCounts = {}
        history.forEach(entry => {
          playCounts[entry.songId] = (playCounts[entry.songId] || 0) + 1
        })
        
        return allSongs
          .map(song => ({
            ...song,
            playCount: playCounts[song.id] || 0
          }))
          .filter(song => song.playCount > 0)
          .sort((a, b) => b.playCount - a.playCount)
          .slice(0, 50)
      }

      case 'favorites':
        return allSongs.filter(song => favorites.includes(song.videoId))

      case 'longDuration':
        return allSongs.filter(song => song.duration > 300)

      case 'shortDuration':
        return allSongs.filter(song => song.duration < 180)

      default:
        return []
    }
  }

  async function fetchMoodPlaylist(moodId) {
    const mood = moodPlaylists.value.find(m => m.id === moodId)
    if (!mood) return []

    if (moodResults.value[moodId]) {
      return moodResults.value[moodId]
    }

    isLoadingMood.value = true
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const result = await electron.innertube.search(mood.query, { type: 'video' })
      
      if (result.success && result.data) {
        const musicOnly = filterMusicContent(result.data)
        const tracks = musicOnly.slice(0, 30).map(item => ({
          videoId: item.id || item.videoId,
          title: item.title || 'Unknown',
          artist: item.author || item.artist || 'Unknown',
          thumbnail: item.thumbnails?.[0]?.url || item.thumbnail || '',
          duration: item.duration || 0
        }))

        moodResults.value[moodId] = tracks
        return tracks
      }
      return []
    } catch (err) {
      console.error(`Failed to fetch mood playlist ${moodId}:`, err)
      return []
    } finally {
      isLoadingMood.value = false
    }
  }

  function clearMoodCache() {
    moodResults.value = {}
  }

  return {
    smartPlaylists,
    moodPlaylists,
    moodResults,
    isLoadingMood,
    generatePlaylist,
    fetchMoodPlaylist,
    clearMoodCache
  }
})
