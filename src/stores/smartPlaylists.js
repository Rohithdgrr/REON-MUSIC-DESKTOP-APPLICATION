import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLibraryStore } from './library.js'
import { useFavoritesStore } from './favorites.js'

export const useSmartPlaylistsStore = defineStore('smartPlaylists', () => {
  const libraryStore = useLibraryStore()
  const favoritesStore = useFavoritesStore()

  const smartPlaylists = ref([
    {
      id: 'recently-added',
      name: 'Recently Added',
      description: 'Songs added in the last 7 days',
      icon: '🆕',
      rule: 'recentlyAdded'
    },
    {
      id: 'most-played',
      name: 'Most Played',
      description: 'Your top 50 most played songs',
      icon: '🔥',
      rule: 'mostPlayed'
    },
    {
      id: 'favorites-mix',
      name: 'Favorites Mix',
      description: 'All your favorite songs',
      icon: '❤️',
      rule: 'favorites'
    },
    {
      id: 'long-songs',
      name: 'Long Songs',
      description: 'Songs longer than 5 minutes',
      icon: '⏱️',
      rule: 'longDuration'
    },
    {
      id: 'short-songs',
      name: 'Short Songs',
      description: 'Songs shorter than 3 minutes',
      icon: '⚡',
      rule: 'shortDuration'
    }
  ])

  // Generate playlist content based on rules
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
        return allSongs.filter(song => song.duration > 300) // > 5 minutes

      case 'shortDuration':
        return allSongs.filter(song => song.duration < 180) // < 3 minutes

      default:
        return []
    }
  }

  return {
    smartPlaylists,
    generatePlaylist
  }
})
