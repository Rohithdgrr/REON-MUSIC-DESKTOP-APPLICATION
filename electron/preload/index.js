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
      getPlaylistSongs: (playlistId) => ipcRenderer.invoke('sqlite:getPlaylistSongs', playlistId),
      addSongToPlaylist: (playlistId, songId, position) => ipcRenderer.invoke('sqlite:addSongToPlaylist', playlistId, songId, position),
      removeSongFromPlaylist: (playlistId, songId) => ipcRenderer.invoke('sqlite:removeSongFromPlaylist', playlistId, songId),
      addToHistory: (songId) => ipcRenderer.invoke('sqlite:addToHistory', songId),
      getHistory: () => ipcRenderer.invoke('sqlite:getHistory'),
      clearHistory: () => ipcRenderer.invoke('sqlite:clearHistory')
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
