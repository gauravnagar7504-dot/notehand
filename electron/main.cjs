const { app, BrowserWindow } = require('electron');
const path = require('path');

// Determine if we are in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // Standard window setup
    title: 'HandNote',
    autoHideMenuBar: true,
  });

  if (isDev) {
    // In development, load from Vite dev server
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load the built static index.html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
