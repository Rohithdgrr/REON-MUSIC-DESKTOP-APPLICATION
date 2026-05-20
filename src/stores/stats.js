import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'

export const useStatsStore = defineStore('stats', () => {
  const totalSongs = ref(0)
  const totalPlaylists = ref(0)
  const totalPlays = ref(0)
  const totalFavorites = ref(0)
  const totalHours = ref(0)
  const totalArtists = ref(0)
  const topSongs = ref([])
  const topArtists = ref([])
  const isLoading = ref(false)
  const isLoaded = ref(false)

  const totalMinutes = computed(() => Math.round(totalHours.value * 60))
  const formattedTime = computed(() => {
    const hrs = Math.floor(totalHours.value)
    const mins = Math.round((totalHours.value - hrs) * 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  })

  async function loadStats(force = false) {
    if (isLoaded.value && !force) return
    isLoading.value = true
    try {
      await waitForElectronApi()
      const electron = getElectronApi()

      const [statsResult, topSongsResult, topArtistsResult] = await Promise.all([
        electron.sqlite.getStats(),
        electron.sqlite.getTopSongs(20),
        electron.sqlite.getTopArtists(10)
      ])

      if (statsResult.success) {
        totalSongs.value = statsResult.data.totalSongs
        totalPlaylists.value = statsResult.data.totalPlaylists
        totalPlays.value = statsResult.data.totalPlays
        totalFavorites.value = statsResult.data.totalFavorites
        totalHours.value = statsResult.data.totalHours
        totalArtists.value = statsResult.data.totalArtists
      }

      if (topSongsResult.success) {
        topSongs.value = topSongsResult.data.map(s => ({
          videoId: s.video_id,
          title: s.title,
          artist: s.artist,
          thumbnail: s.thumbnail_url,
          duration: s.duration_seconds,
          playCount: s.playCount
        }))
      }

      if (topArtistsResult.success) {
        topArtists.value = topArtistsResult.data
      }

      isLoaded.value = true
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    totalSongs,
    totalPlaylists,
    totalPlays,
    totalFavorites,
    totalHours,
    totalMinutes,
    formattedTime,
    totalArtists,
    topSongs,
    topArtists,
    isLoading,
    isLoaded,
    loadStats
  }
})
