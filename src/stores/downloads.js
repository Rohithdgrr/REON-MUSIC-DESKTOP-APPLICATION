import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { waitForElectronApi, getElectronApi } from '../utils/electronApi.js'
import { normalizeTrack } from '../utils/trackNormalizer.js'

export const useDownloadsStore = defineStore('downloads', () => {
  const downloadedSongs = ref([])
  const isLoaded = ref(false)
  const isLoading = ref(false)

  const downloadCount = computed(() => downloadedSongs.value.length)

  async function loadDownloads(force = false) {
    if (isLoaded.value && !force) return downloadedSongs.value
    isLoading.value = true
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const result = await electron.downloads.getDownloads()
      if (result.success) {
        downloadedSongs.value = result.data.map(d => normalizeTrack(d))
        isLoaded.value = true
      }
    } catch (err) {
      console.error('Failed to load downloads:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addDownload(track) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const result = await electron.downloads.addDownload({
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail || '',
        duration: track.duration || 0
      })
      if (result.success) {
        await loadDownloads(true)
      }
      return result.success
    } catch (err) {
      console.error('Failed to add download:', err)
      return false
    }
  }

  async function removeDownload(id) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const result = await electron.downloads.removeDownload(id)
      if (result.success) {
        downloadedSongs.value = downloadedSongs.value.filter(d => d.id !== id)
      }
      return result.success
    } catch (err) {
      console.error('Failed to remove download:', err)
      return false
    }
  }

  async function isDownloaded(videoId) {
    try {
      await waitForElectronApi()
      const electron = getElectronApi()
      const result = await electron.downloads.isDownloaded(videoId)
      return result.success ? result.data : false
    } catch (err) {
      console.error('Failed to check download status:', err)
      return false
    }
  }

  return {
    downloadedSongs,
    isLoaded,
    isLoading,
    downloadCount,
    loadDownloads,
    addDownload,
    removeDownload,
    isDownloaded
  }
})
