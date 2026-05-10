import { ipcMain } from 'electron'
import { innertubeService } from '../services/InnertubeService.js'
import log from 'electron-log'

export function registerInnertubeIPC() {
  ipcMain.handle('innertube:search', async (_event, query, options = {}) => {
    try {
      const results = await innertubeService.search(query, options)
      return { success: true, data: results }
    } catch (err) {
      log.error('IPC innertube:search error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('innertube:getAudioUrl', async (_event, videoId) => {
    try {
      const url = await innertubeService.getAudioUrl(videoId)
      return { success: true, data: url }
    } catch (err) {
      log.error('IPC innertube:getAudioUrl error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('innertube:getVideoInfo', async (_event, videoId) => {
    try {
      const info = await innertubeService.getVideoInfo(videoId)
      return { success: true, data: info }
    } catch (err) {
      log.error('IPC innertube:getVideoInfo error:', err.message)
      return { success: false, error: err.message }
    }
  })
}
