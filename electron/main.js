import { app, BrowserWindow } from 'electron'
import path from 'node:path'

// Silenciar advertencias de seguridad innecesarias durante el desarrollo
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "LalibreINV",
    icon: path.join(process.env.VITE_PUBLIC, 'LALIBRE.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // Ocultar el menú superior estilo Windows de los años 90
  win.setMenuBarVisibility(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})