import path from 'node:path'
import { app, BrowserWindow, ipcMain } from 'electron'
import { initializeDatabase } from './services/databaseService'
import { registerIpcHandlers } from './ipc/handlers'

let mainWindow
let handlersRegistered = false

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1560,
    height: 980,
    minWidth: 1220,
    minHeight: 760,
    backgroundColor: '#050816',
    title: 'Axiom',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, '../preload/index.mjs'),
      sandbox: false,
      devTools: true
    }
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  initializeDatabase()

  if (!handlersRegistered) {
    registerIpcHandlers(ipcMain)
    handlersRegistered = true
  }

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
