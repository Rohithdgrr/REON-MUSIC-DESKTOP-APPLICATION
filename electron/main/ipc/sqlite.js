import { ipcMain, dialog } from 'electron'
import { getDb } from '../db/connection.js'
import log from 'electron-log'
import fs from 'fs'

function getNextId(arr) {
  if (!arr || arr.length === 0) return 1
  return Math.max(...arr.map(i => i.id || 0)) + 1
}

export function registerSqliteIPC() {
  ipcMain.handle('sqlite:getAllSongs', async () => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure songs array exists
      if (!db.data.songs) {
        db.data.songs = []
        await db.write()
      }
      
      const songs = [...db.data.songs].sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
      return { success: true, data: songs }
    } catch (err) {
      log.error('IPC sqlite:getAllSongs error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:addSong', async (_event, song) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure songs array exists
      if (!db.data.songs) {
        db.data.songs = []
      }
      
      let existing = db.data.songs.find(s => s.video_id === song.videoId)
      if (!existing) {
        existing = {
          id: getNextId(db.data.songs),
          video_id: song.videoId,
          title: song.title,
          artist: song.artist,
          thumbnail_url: song.thumbnail || '',
          duration_seconds: song.duration || 0,
          added_at: new Date().toISOString()
        }
        db.data.songs.push(existing)
        await db.write()
      }
      return { success: true, data: { id: existing.id } }
    } catch (err) {
      log.error('IPC sqlite:addSong error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:removeSong', async (_event, videoId) => {
    try {
      const db = getDb()
      await db.read()
      db.data.songs = db.data.songs.filter(s => s.video_id !== videoId)
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:removeSong error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:getPlaylists', async () => {
    try {
      const db = getDb()
      await db.read()

      // Ensure playlists array exists
      if (!db.data.playlists) {
        db.data.playlists = []
        await db.write()
      }

      const playlistSongs = db.data.playlistSongs || []
      const countByPlaylist = playlistSongs.reduce((acc, ps) => {
        acc[ps.playlist_id] = (acc[ps.playlist_id] || 0) + 1
        return acc
      }, {})

      const playlists = [...db.data.playlists]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(p => ({ ...p, song_count: countByPlaylist[p.id] || 0 }))

      return { success: true, data: playlists }
    } catch (err) {
      log.error('IPC sqlite:getPlaylists error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:createPlaylist', async (_event, name, description = '', color = 'indigo') => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure playlists array exists
      if (!db.data.playlists) {
        db.data.playlists = []
      }
      
      const id = getNextId(db.data.playlists)
      const playlist = {
        id,
        name,
        description: description || '',
        color: color || 'indigo',
        created_at: new Date().toISOString()
      }
      db.data.playlists.push(playlist)
      await db.write()
      return { success: true, data: playlist }
    } catch (err) {
      log.error('IPC sqlite:createPlaylist error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:deletePlaylist', async (_event, playlistId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure arrays exist
      if (!db.data.playlists) {
        db.data.playlists = []
      }
      if (!db.data.playlistSongs) {
        db.data.playlistSongs = []
      }
      
      db.data.playlists = db.data.playlists.filter(p => p.id !== playlistId)
      db.data.playlistSongs = db.data.playlistSongs.filter(ps => ps.playlist_id !== playlistId)
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:deletePlaylist error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:updatePlaylist', async (_event, playlistId, data) => {
    try {
      const db = getDb()
      await db.read()
      
      if (!db.data.playlists) {
        db.data.playlists = []
      }
      
      const index = db.data.playlists.findIndex(p => p.id === playlistId)
      if (index === -1) {
        return { success: false, error: 'Playlist not found' }
      }
      
      if (data.name !== undefined) db.data.playlists[index].name = data.name
      if (data.description !== undefined) db.data.playlists[index].description = data.description
      if (data.created_at !== undefined) db.data.playlists[index].created_at = data.created_at
      
      await db.write()
      return { success: true, data: db.data.playlists[index] }
    } catch (err) {
      log.error('IPC sqlite:updatePlaylist error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:getPlaylistSongs', async (_event, playlistId) => {
    try {
      const db = getDb()
      await db.read()
      const songIds = db.data.playlistSongs
        .filter(ps => ps.playlist_id === playlistId)
        .sort((a, b) => a.position - b.position)
        .map(ps => ps.song_id)
      const songs = songIds.map(id => db.data.songs.find(s => s.id === id)).filter(Boolean)
      return { success: true, data: songs }
    } catch (err) {
      log.error('IPC sqlite:getPlaylistSongs error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:addSongToPlaylist', async (_event, playlistId, songId, position) => {
    try {
      const db = getDb()
      await db.read()
      const exists = db.data.playlistSongs.find(ps => ps.playlist_id === playlistId && ps.song_id === songId)
      if (!exists) {
        db.data.playlistSongs.push({ playlist_id: playlistId, song_id: songId, position: position || 0 })
        await db.write()
      }
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:addSongToPlaylist error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:removeSongFromPlaylist', async (_event, playlistId, songId) => {
    try {
      const db = getDb()
      await db.read()
      db.data.playlistSongs = db.data.playlistSongs.filter(
        ps => !(ps.playlist_id === playlistId && ps.song_id === songId)
      )
      // Re-index positions after removal
      const remaining = db.data.playlistSongs
        .filter(ps => ps.playlist_id === playlistId)
        .sort((a, b) => a.position - b.position)
      remaining.forEach((ps, i) => {
        const item = db.data.playlistSongs.find(p => p.playlist_id === ps.playlist_id && p.song_id === ps.song_id)
        if (item) item.position = i
      })
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:removeSongFromPlaylist error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:reorderPlaylistTrack', async (_event, playlistId, songId, newPosition) => {
    try {
      const db = getDb()
      await db.read()
      
      const entries = db.data.playlistSongs
        .filter(ps => ps.playlist_id === playlistId)
        .sort((a, b) => a.position - b.position)
      
      const oldIndex = entries.findIndex(ps => ps.song_id === songId)
      if (oldIndex === -1) return { success: false, error: 'Song not in playlist' }
      
      // Remove from old position
      const [moved] = entries.splice(oldIndex, 1)
      // Insert at new position
      entries.splice(newPosition, 0, moved)
      // Re-index all positions
      entries.forEach((ps, i) => {
        const item = db.data.playlistSongs.find(p => p.playlist_id === playlistId && p.song_id === ps.song_id)
        if (item) item.position = i
      })
      
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:reorderPlaylistTrack error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:addToHistory', async (_event, songId) => {
    try {
      const db = getDb()
      await db.read()
      db.data.playHistory.push({
        id: getNextId(db.data.playHistory),
        song_id: songId,
        played_at: new Date().toISOString()
      })
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:addToHistory error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:getHistory', async () => {
    try {
      const db = getDb()
      await db.read()
      const history = db.data.playHistory
        .slice()
        .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
        .slice(0, 100)
        .map(h => {
          const song = db.data.songs.find(s => s.id === h.song_id)
          return {
            ...h,
            title: song?.title || 'Unknown',
            artist: song?.artist || 'Unknown',
            thumbnail_url: song?.thumbnail_url || '',
            video_id: song?.video_id || ''
          }
        })
      return { success: true, data: history }
    } catch (err) {
      log.error('IPC sqlite:getHistory error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:clearHistory', async () => {
    try {
      const db = getDb()
      await db.read()
      db.data.playHistory = []
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:clearHistory error:', err.message)
      return { success: false, error: err.message }
    }
  })

  // Favorites
  ipcMain.handle('sqlite:getFavorites', async () => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure favorites array exists
      if (!db.data.favorites) {
        db.data.favorites = []
        await db.write()
      }
      
      const favorites = db.data.favorites
        .slice()
        .sort((a, b) => new Date(b.added_at) - new Date(a.added_at))
        .map(f => {
          const song = db.data.songs.find(s => s.id === f.song_id)
          return {
            ...f,
            title: song?.title || 'Unknown',
            artist: song?.artist || 'Unknown',
            thumbnail_url: song?.thumbnail_url || '',
            video_id: song?.video_id || '',
            duration_seconds: song?.duration_seconds || 0
          }
        })
      return { success: true, data: favorites }
    } catch (err) {
      log.error('IPC sqlite:getFavorites error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:addFavorite', async (_event, songId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure favorites array exists
      if (!db.data.favorites) {
        db.data.favorites = []
      }
      
      const exists = db.data.favorites.find(f => f.song_id === songId)
      if (!exists) {
        db.data.favorites.push({
          id: getNextId(db.data.favorites),
          song_id: songId,
          added_at: new Date().toISOString()
        })
        await db.write()
      }
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:addFavorite error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:removeFavorite', async (_event, songId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure favorites array exists
      if (!db.data.favorites) {
        db.data.favorites = []
      }
      
      db.data.favorites = db.data.favorites.filter(f => f.song_id !== songId)
      await db.write()
      return { success: true }
    } catch (err) {
      log.error('IPC sqlite:removeFavorite error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:isFavorite', async (_event, songId) => {
    try {
      const db = getDb()
      await db.read()
      
      // Ensure favorites array exists
      if (!db.data.favorites) {
        db.data.favorites = []
      }
      
      const isFavorite = db.data.favorites.some(f => f.song_id === songId)
      return { success: true, data: isFavorite }
    } catch (err) {
      log.error('IPC sqlite:isFavorite error:', err.message)
      return { success: false, error: err.message }
    }
  })

  // Statistics
  ipcMain.handle('sqlite:getStats', async () => {
    try {
      const db = getDb()
      await db.read()
      
      const totalSongs = db.data.songs.length
      const totalPlaylists = db.data.playlists.length
      const totalPlays = db.data.playHistory.length
      const totalFavorites = db.data.favorites.length
      
      // Calculate listening time from actual play history rather than the full library.
      const totalSeconds = db.data.playHistory.reduce((sum, historyItem) => {
        const song = db.data.songs.find(s => s.id === historyItem.song_id)
        return sum + (song?.duration_seconds || 0)
      }, 0)
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10
      
      // Get unique artists
      const artists = new Set(db.data.songs.map(s => s.artist))
      const totalArtists = artists.size
      
      return {
        success: true,
        data: {
          totalSongs,
          totalPlaylists,
          totalPlays,
          totalFavorites,
          totalHours,
          totalArtists
        }
      }
    } catch (err) {
      log.error('IPC sqlite:getStats error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:getTopSongs', async (_event, limit = 50) => {
    try {
      const db = getDb()
      await db.read()
      
      // Count plays for each song
      const playCounts = {}
      db.data.playHistory.forEach(h => {
        playCounts[h.song_id] = (playCounts[h.song_id] || 0) + 1
      })
      
      // Get top songs
      const topSongs = Object.entries(playCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([songId, playCount]) => {
          const song = db.data.songs.find(s => s.id === parseInt(songId))
          return {
            ...song,
            playCount
          }
        })
        .filter(s => s.title)
      
      return { success: true, data: topSongs }
    } catch (err) {
      log.error('IPC sqlite:getTopSongs error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:getTopArtists', async (_event, limit = 20) => {
    try {
      const db = getDb()
      await db.read()
      
      // Count plays for each artist
      const artistCounts = {}
      db.data.playHistory.forEach(h => {
        const song = db.data.songs.find(s => s.id === h.song_id)
        if (song && song.artist) {
          artistCounts[song.artist] = (artistCounts[song.artist] || 0) + 1
        }
      })
      
      // Get top artists
      const topArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, playCount]) => ({ name, playCount }))
      
      return { success: true, data: topArtists }
    } catch (err) {
      log.error('IPC sqlite:getTopArtists error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:exportPlaylists', async () => {
    try {
      const db = getDb()
      await db.read()
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        playlists: db.data.playlists || [],
        playlistSongs: db.data.playlistSongs || []
      }
      const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Export Playlists',
        defaultPath: `music-reon-playlists-${Date.now()}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      })
      if (canceled || !filePath) return { success: false, canceled: true }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return { success: true, filePath }
    } catch (err) {
      log.error('IPC sqlite:exportPlaylists error:', err.message)
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('sqlite:importPlaylists', async () => {
    try {
      const { filePaths, canceled } = await dialog.showOpenDialog({
        title: 'Import Playlists',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      })
      if (canceled || !filePaths?.length) return { success: false, canceled: true }
      
      const raw = fs.readFileSync(filePaths[0], 'utf-8')
      const data = JSON.parse(raw)
      
      if (!data.playlists || !Array.isArray(data.playlists)) {
        return { success: false, error: 'Invalid playlist file' }
      }
      
      const db = getDb()
      await db.read()
      
      const existingIds = new Set((db.data.playlists || []).map(p => p.id))
      let imported = 0
      
      for (const pl of data.playlists) {
        if (!existingIds.has(pl.id)) {
          db.data.playlists.push(pl)
          existingIds.add(pl.id)
          imported++
        }
      }
      
      // Import playlist songs
      const existingPS = new Set(
        (db.data.playlistSongs || []).map(ps => `${ps.playlist_id}-${ps.song_id}`)
      )
      for (const ps of (data.playlistSongs || [])) {
        const key = `${ps.playlist_id}-${ps.song_id}`
        if (!existingPS.has(key) && existingIds.has(ps.playlist_id)) {
          db.data.playlistSongs.push(ps)
          existingPS.add(key)
        }
      }
      
      await db.write()
      return { success: true, imported }
    } catch (err) {
      log.error('IPC sqlite:importPlaylists error:', err.message)
      return { success: false, error: err.message }
    }
  })
}
