import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import log from 'electron-log'
import { initDatabase, closeDatabase } from './db/connection.js'
import { registerInnertubeIPC } from './ipc/innertube.js'
import { registerSqliteIPC } from './ipc/sqlite.js'
import { registerDownloadsIPC } from './ipc/downloads.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.env.APP_ROOT = join(__dirname, '../..')

const MAIN_DIST = join(process.env.APP_ROOT, 'out', 'main')
const RENDERER_DIST = join(process.env.APP_ROOT, 'dist-electron', 'renderer')

let mainWindow = null
let tray = null

function getPreloadPath() {
  const candidates = [
    join(__dirname, '../preload/index.mjs'),
    join(__dirname, '../preload/index.js'),
    join(process.env.APP_ROOT, 'out/preload/index.mjs'),
    join(process.env.APP_ROOT, 'out/preload/index.js'),
    join(process.env.APP_ROOT, 'dist-electron/preload/index.mjs'),
    join(process.env.APP_ROOT, 'dist-electron/preload/index.js')
  ]
  for (const path of candidates) {
    if (existsSync(path)) {
      log.info('Using preload script:', path)
      return path
    }
  }
  log.error('No preload script found! Checked:', candidates)
  return candidates[0]
}

log.info('Starting Music Reon...')

function createTray() {
  // Create a simple tray icon (16x16 transparent PNG)
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFJSURBVDiNpZK/S8NAGMWf'
  )

  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Music Reon',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: 'Play/Pause',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-play-pause')
        }
      }
    },
    {
      label: 'Next Track',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-next')
        }
      }
    },
    {
      label: 'Previous Track',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('tray-previous')
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])
  
  tray.setToolTip('Music Reon')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    } else {
      createWindow()
    }
  })
}

function createWindow() {
  const preloadPath = getPreloadPath()
  
  log.info('Creating window with preload:', preloadPath)
  log.info('Preload file exists:', existsSync(preloadPath))
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Music Reon',
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      sandbox: false
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    log.info('Page finished loading')
    mainWindow.webContents.executeJavaScript(`
      console.log('[Main] Checking window.electron from main process');
      console.log('[Main] window.electron:', typeof window.electron);
      console.log('[Main] Available keys:', Object.keys(window));
    `).catch(err => {
      log.error('Failed to execute JavaScript:', err)
    })
  })

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(RENDERER_DIST, 'index.html'))
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    await initDatabase()
    registerInnertubeIPC()
    registerSqliteIPC()
    registerDownloadsIPC()
    createWindow()
    createTray()
    log.info('App initialized successfully')
  } catch (err) {
    log.error('Failed to initialize app:', err.message)
    app.quit()
  }
})

app.on('window-all-closed', async () => {
  // Don't quit on window close - keep running in tray
  // await closeDatabase()
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', async (event) => {
  app.isQuitting = true
  await closeDatabase()
})

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err)
})

process.on('unhandledRejection', (err) => {
  log.error('Unhandled rejection:', err)
})
