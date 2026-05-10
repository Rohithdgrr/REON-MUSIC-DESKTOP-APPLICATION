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
  playCounts: {}
}

export async function initDatabase() {
  if (db) return db

  const dbPath = getDbPath()
  log.info('Initializing JSON database at:', dbPath)

  const adapter = new JSONFile(dbPath)
  db = new Low(adapter, defaultData)
  await db.read()
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
