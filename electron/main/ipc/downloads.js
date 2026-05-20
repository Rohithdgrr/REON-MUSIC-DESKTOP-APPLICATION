import { ipcMain } from 'electron'
import { getDb } from '../db/connection.js'
import log from 'electron-log'

function getNextId(arr) {
  if (!arr || arr.length === 0) return 1
  return Math.max(...arr.map(i => i.id || 0)) + 1
}

export function registerDownloadsIPC() {
  ipcMain.handle('downloads:getDownloads', async () => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure downloads array exists
      if (!db.data.downloads) {
        db.data.downloads = []
        await db.write()
      }
      
      const downloads = [...db.data.downloads].sort((a, b) => new Date(b.downloadedAt) - new Date(a.downloadedAt))
      return { success: true, data: downloads }
    } catch (err) {
      log.error('IPC downloads:getDownloads error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('downloads:addDownload', async (_event, track) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure downloads array exists
      if (!db.data.downloads) {
        db.data.downloads = []
      }
      
      const exists = db.data.downloads.find(d => d.videoId === track.videoId)
      if (!exists) {
        db.data.downloads.push({
          id: getNextId(db.data.downloads),
          videoId: track.videoId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail || '',
          duration: track.duration || 0,
          downloadedAt: new Date().toISOString()
        })
        await db.write()
      }
      return { success: true }
    } catch (err) {
      log.error('IPC downloads:addDownload error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('downloads:removeDownload', async (_event, id) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure downloads array exists
      if (!db.data.downloads) {
        db.data.downloads = []
      }
      
      db.data.downloads = db.data.downloads.filter(d => d.id !== id)
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC downloads:removeDownload error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('downloads:getDownloadPath', async () => {
    try {
      const db = getDb()
      await db.read()
      return { success: true, data: db.data.downloadPath || '' }
    } catch (err) {
      log.error('IPC downloads:getDownloadPath error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('downloads:isDownloaded', async (_event, videoId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure downloads array exists
      if (!db.data.downloads) {
        db.data.downloads = []
      }
      
      const exists = db.data.downloads.some(d => d.videoId === videoId)
      return { success: true, data: exists }
    } catch (err) {
      log.error('IPC downloads:isDownloaded error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('downloads:getDownloadStatus', async (_event, videoId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure downloads array exists
      if (!db.data.downloads) {
        db.data.downloads = []
      }
      
      const dl = db.data.downloads.find(d => d.videoId === videoId)
      return { success: true, data: dl ? 'completed' : null }
    } catch (err) {
      log.error('IPC downloads:getDownloadStatus error:', err.message)
      return { success: false, error: err.message }
    }
  })
}
