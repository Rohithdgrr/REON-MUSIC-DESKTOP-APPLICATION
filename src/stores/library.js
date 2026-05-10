import { defineStore } from 'pinia'
import { ref } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'

export const useLibraryStore = defineStore('library', () => {
  const songs = ref([])
  const playlists = ref([])
  const history = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Songs
  async function loadSongs() {
    isLoading.value = true
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.getAllSongs()
      if (result.success) {
        songs.value = result.data
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load songs:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addSong(song) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.addSong(song)
      if (result.success) {
        await loadSongs()
      }
      return result.success
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  async function removeSong(videoId) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.removeSong(videoId)
      if (result.success) {
        await loadSongs()
      }
      return result.success
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  // Playlists
  async function loadPlaylists() {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.getPlaylists()
      if (result.success) {
        playlists.value = result.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load playlists:', err)
    }
  }

  async function createPlaylist(name) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.createPlaylist(name)
      if (result.success) {
        await loadPlaylists()
      }
      return result
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    }
  }

  async function deletePlaylist(id) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.deletePlaylist(id)
      if (result.success) {
        await loadPlaylists()
      }
      return result.success
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  // History
  async function loadHistory() {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.getHistory()
      if (result.success) {
        history.value = result.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load history:', err)
    }
  }

  async function clearHistory() {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      
      const result = await electron.sqlite.clearHistory()
      if (result.success) {
        history.value = []
      }
    } catch (err) {
      error.value = err.message
    }
  }

  return {
    songs,
    playlists,
    history,
    isLoading,
    error,
    loadSongs,
    addSong,
    removeSong,
    loadPlaylists,
    createPlaylist,
    deletePlaylist,
    loadHistory,
    clearHistory
  }
})
