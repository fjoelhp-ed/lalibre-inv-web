import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 900,
    title: "LalibreINV Pro - ATLAS.ti Edition",
    icon: path.join(process.env.VITE_PUBLIC, 'LALIBRE.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  win.setMenuBarVisibility(false)

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// 1. Crear Estructura de Directorios del Proyecto
ipcMain.handle('select-project-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Selecciona la carpeta raíz para tu Nuevo Proyecto'
  })
  
  if (canceled) return null
  const rootPath = filePaths[0]
  
  const subFolders = [
    path.join(rootPath, 'Biblioteca', 'Documentos'),
    path.join(rootPath, 'Biblioteca', 'Multimedia'),
    path.join(rootPath, 'Resultados', 'Visualizaciones'),
    path.join(rootPath, 'Referencias')
  ]
  
  subFolders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  })
  
  return { rootPath }
})

// 2. Importar Archivos Multiformato
ipcMain.handle('import-file-to-lib', async (event, { rootPath }) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Importar Archivo a LalibreINV',
    filters: [
      { name: 'Todos los Soportados', extensions: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mp3', 'wav'] },
      { name: 'Documentos', extensions: ['pdf', 'doc', 'docx', 'txt'] },
      { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg'] },
      { name: 'Videos', extensions: ['mp4', 'avi'] },
      { name: 'Audios', extensions: ['mp3', 'wav'] }
    ],
    properties: ['openFile']
  })
  
  if (canceled) return null
  const sourcePath = filePaths[0]
  const fileName = path.basename(sourcePath)
  const ext = path.extname(sourcePath).toLowerCase()
  
  let targetFolder = 'Documentos';
  let fileType = 'document';
  
  if (['.png', '.jpg', '.jpeg'].includes(ext)) { targetFolder = 'Multimedia'; fileType = 'image'; }
  else if (['.mp4', '.avi'].includes(ext)) { targetFolder = 'Multimedia'; fileType = 'video'; }
  else if (['.mp3', '.wav'].includes(ext)) { targetFolder = 'Multimedia'; fileType = 'audio'; }
  else if (ext === '.pdf') { fileType = 'pdf'; }
  
  const destPath = path.join(rootPath, 'Biblioteca', targetFolder, fileName)
  fs.copyFileSync(sourcePath, destPath)
  
  return { fileName, fullPath: `file://${destPath}`, type: fileType, targetFolder }
})

// 3. Abrir la carpeta en el explorador
ipcMain.handle('open-path', async (event, targetPath) => {
  shell.openPath(targetPath)
})

// 4. NUEVO: Auto-respaldo Silencioso en la Carpeta del Usuario
ipcMain.on('auto-save-project', (event, { rootPath, data }) => {
  if (!rootPath) return;
  try {
    const backupPath = path.join(rootPath, `Respaldo_LalibreINV.json`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error al hacer auto-respaldo:", error);
  }
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })