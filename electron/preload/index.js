import { contextBridge, ipcRenderer } from 'electron'

console.log('[Preload] Starting preload script...')
console.log('[Preload] contextBridge:', typeof contextBridge)
console.log('[Preload] ipcRenderer:', typeof ipcRenderer)

try {
  const api = {
    innertube: {
      search: (query, options) => ipcRenderer.invoke('innertube:search', query, options),
      getAudioUrl: (videoId) => ipcRenderer.invoke('innertube:getAudioUrl', videoId),
      getVideoInfo: (videoId) => ipcRenderer.invoke('innertube:getVideoInfo', videoId)
    },
    sqlite: {
      getAllSongs: () => ipcRenderer.invoke('sqlite:getAllSongs'),
      addSong: (song) => ipcRenderer.invoke('sqlite:addSong', song),
      removeSong: (videoId) => ipcRenderer.invoke('sqlite:removeSong', videoId),
      getPlaylists: () => ipcRenderer.invoke('sqlite:getPlaylists'),
      createPlaylist: (name) => ipcRenderer.invoke('sqlite:createPlaylist', name),
      deletePlaylist: (id) => ipcRenderer.invoke('sqlite:deletePlaylist', id),
      updatePlaylist: (playlistId, data) => ipcRenderer.invoke('sqlite:updatePlaylist', playlistId, data),
      getPlaylistSongs: (playlistId) => ipcRenderer.invoke('sqlite:getPlaylistSongs', playlistId),
      addSongToPlaylist: (playlistId, songId, position) => ipcRenderer.invoke('sqlite:addSongToPlaylist', playlistId, songId, position),
      removeSongFromPlaylist: (playlistId, songId) => ipcRenderer.invoke('sqlite:removeSongFromPlaylist', playlistId, songId),
      reorderPlaylistTrack: (playlistId, songId, newPosition) => ipcRenderer.invoke('sqlite:reorderPlaylistTrack', playlistId, songId, newPosition),
      addToHistory: (songId) => ipcRenderer.invoke('sqlite:addToHistory', songId),
      getHistory: () => ipcRenderer.invoke('sqlite:getHistory'),
      clearHistory: () => ipcRenderer.invoke('sqlite:clearHistory'),
      getFavorites: () => ipcRenderer.invoke('sqlite:getFavorites'),
      addFavorite: (songId) => ipcRenderer.invoke('sqlite:addFavorite', songId),
      removeFavorite: (songId) => ipcRenderer.invoke('sqlite:removeFavorite', songId),
      isFavorite: (songId) => ipcRenderer.invoke('sqlite:isFavorite', songId),
      getStats: () => ipcRenderer.invoke('sqlite:getStats'),
      getTopSongs: (limit) => ipcRenderer.invoke('sqlite:getTopSongs', limit),
      getTopArtists: (limit) => ipcRenderer.invoke('sqlite:getTopArtists', limit),
      exportPlaylists: () => ipcRenderer.invoke('sqlite:exportPlaylists'),
      importPlaylists: () => ipcRenderer.invoke('sqlite:importPlaylists')
    },
    downloads: {
      getDownloads: () => ipcRenderer.invoke('downloads:getDownloads'),
      addDownload: (track) => ipcRenderer.invoke('downloads:addDownload', track),
      removeDownload: (id) => ipcRenderer.invoke('downloads:removeDownload', id),
      getDownloadPath: () => ipcRenderer.invoke('downloads:getDownloadPath'),
      isDownloaded: (videoId) => ipcRenderer.invoke('downloads:isDownloaded', videoId),
      getDownloadStatus: (videoId) => ipcRenderer.invoke('downloads:getDownloadStatus', videoId)
    }
  }
  
  console.log('[Preload] API object created:', Object.keys(api))
  
  contextBridge.exposeInMainWorld('electron', api)
  
  console.log('[Preload] API exposed successfully')
  
  // Verify it was exposed
  console.log('[Preload] Verification - window.electron should now be available in renderer')
} catch (err) {
  console.error('[Preload] Failed to expose API:', err)
  console.error('[Preload] Error stack:', err.stack)
}
