import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { app } from 'electron'
import { join } from 'path'
import log from 'electron-log'

let db = null

function getDbPath() {
  const userData = app.getPath('userData')
  return join(userData, 'music-reon.json')
}

const defaultData = {
  songs: [],
  playlists: [],
  playlistSongs: [],
  playHistory: [],
  favorites: [],
  playCounts: {},
  downloads: [],
  downloadPath: ''
}

export async function initDatabase() {
  if (db) return db

  const dbPath = getDbPath()
  log.info('Initializing JSON database at:', dbPath)

  const adapter = new JSONFile(dbPath)
  db = new Low(adapter, defaultData)
  await db.read()
  
  // Ensure all required properties exist with proper defaults
  db.data = db.data || {}
  db.data.songs = db.data.songs || []
  db.data.playlists = db.data.playlists || []
  db.data.playlistSongs = db.data.playlistSongs || []
  db.data.playHistory = db.data.playHistory || []
  db.data.favorites = db.data.favorites || []
  db.data.playCounts = db.data.playCounts || {}
  db.data.downloads = db.data.downloads || []
  db.data.downloadPath = db.data.downloadPath || ''
  
  await db.write()

  log.info('Database initialized successfully')
  return db
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export async function closeDatabase() {
  if (db) {
    await db.write()
    db = null
    log.info('Database connection closed')
  }
}
