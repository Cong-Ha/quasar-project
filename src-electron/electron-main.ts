import { app, BrowserWindow, desktopCapturer, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import fs from 'fs';

const platform = process.platform || os.platform();
const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;

function setCspHeaders(win: BrowserWindow) {
  const isDev = process.env.DEV;

  const policy = isDev
    ? "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src *;"
    : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; media-src 'self' blob:; frame-src 'none';";

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [policy]
      }
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'),
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !process.env.DEV,
      allowRunningInsecureContent: !!process.env.DEV,
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      ),
    },
  });

  setCspHeaders(mainWindow);

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  if (process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

// Check and guide user for screen recording permissions (macOS)
async function checkScreenRecordingPermission(): Promise<{ hasPermission: boolean; message?: string }> {
  if (platform !== 'darwin') {
    return { hasPermission: true }; // Other platforms don't need explicit permission
  }

  try {
    // Try to get sources to test if we have permission
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1, height: 1 }
    });
    
    // If we get sources, we have permission
    if (sources && sources.length > 0) {
      return { hasPermission: true };
    } else {
      return { 
        hasPermission: false, 
        message: 'No screen sources available. Please grant screen recording permission.' 
      };
    }
  } catch (error) {
    console.error('Screen recording permission check failed:', error);
    return { 
      hasPermission: false, 
      message: 'Screen recording permission denied. Please grant permission in System Preferences.' 
    };
  }
}

// Guide user to grant screen recording permission
async function promptForScreenRecordingPermission(): Promise<boolean> {
  if (platform !== 'darwin') return true;

  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Screen Recording Permission Required',
    message: 'This app needs permission to record your screen.',
    detail: 'To grant permission:\n\n1. Go to System Preferences\n2. Click Security & Privacy\n3. Click Privacy tab\n4. Select "Screen Recording" from the list\n5. Check the box next to this app\n6. Restart the app if needed',
    buttons: ['Open System Preferences', 'Cancel', 'I\'ve Already Done This'],
    defaultId: 0,
    cancelId: 1
  });

  if (result.response === 0) {
    // Open System Preferences to Privacy settings
    await shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
    return false;
  } else if (result.response === 2) {
    // User claims they've already granted permission, let's check again
    const checkResult = await checkScreenRecordingPermission();
    return checkResult.hasPermission;
  }

  return false; // User cancelled
}

// Screen recording functions
ipcMain.handle('get-sources', async () => {
  try {
    // Check permissions first
    const permissionCheck = await checkScreenRecordingPermission();
    
    if (!permissionCheck.hasPermission) {
      // Try to prompt user for permission
      const userGranted = await promptForScreenRecordingPermission();
      if (!userGranted) {
        throw new Error(permissionCheck.message || 'Screen recording permission required');
      }
      
      // Check again after user interaction
      const recheckResult = await checkScreenRecordingPermission();
      if (!recheckResult.hasPermission) {
        throw new Error('Screen recording permission still not granted. Please restart the app after granting permission.');
      }
    }

    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 },
      fetchWindowIcons: true
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL(),
      display_id: source.display_id,
      appIcon: source.appIcon?.toDataURL()
    }));
  } catch (error) {
    console.error('Error getting sources:', error);
    throw new Error(`Failed to get sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Get desktop capturer source for renderer process
ipcMain.handle('get-desktop-capturer-source', async (event, sourceId: string) => {
  try {
    const permissionCheck = await checkScreenRecordingPermission();
    if (!permissionCheck.hasPermission) {
      throw new Error('Screen recording permission denied.');
    }

    // Return the source ID for use in renderer process
    return { sourceId };
  } catch (error) {
    console.error('Error getting desktop capturer source:', error);
    throw error;
  }
});

// Save recorded video file
ipcMain.handle('save-video', async (event, buffer: ArrayBuffer) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      buttonLabel: 'Save video',
      defaultPath: `recording-${Date.now()}.webm`,
      filters: [
        { name: 'WebM Videos', extensions: ['webm'] },
        { name: 'MP4 Videos', extensions: ['mp4'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePath) {
      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath;
    }
    return null;
  } catch (error) {
    console.error('Error saving video:', error);
    throw new Error('Failed to save video file');
  }
});

// Show error dialog
ipcMain.handle('show-error-dialog', (event, title: string, content: string) => {
  if (mainWindow) {
    dialog.showErrorBox(title, content);
  }
});

// Check permission status
ipcMain.handle('check-screen-permission', async () => {
  return await checkScreenRecordingPermission();
});

// Request permission
ipcMain.handle('request-screen-permission', async () => {
  return await promptForScreenRecordingPermission();
});

void app.whenReady().then(async () => {
  await createWindow();
  
  // Check permissions on startup for macOS
  if (platform === 'darwin') {
    const permissionCheck = await checkScreenRecordingPermission();
    if (!permissionCheck.hasPermission) {
      console.log('Screen recording permission not granted on startup');
    }
  }
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});

// Handle app certificate verification (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (process.env.DEV) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});
