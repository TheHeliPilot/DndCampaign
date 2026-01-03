const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let saveFolderPath = null;
let localSaveFolder = null;

// Get the directory where the app executable is located
const getAppDirectory = () => {
    if (app.isPackaged) {
        // Check for portable.txt to indicate portable mode
        // Electron-builder portable creates this file
        const exePath = process.execPath;
        const exeDir = path.dirname(exePath);
        const portableFile = path.join(exeDir, 'portable.txt');

        console.log('Packaged app - exe path:', exePath);
        console.log('Checking for portable file:', portableFile);
        console.log('Portable file exists:', fs.existsSync(portableFile));

        // Always use exe directory for portable builds
        // This works for both extracted portable exe and regular installs
        console.log('Using directory:', exeDir);
        return exeDir;
    } else {
        // In development, use __dirname
        console.log('Development mode - using __dirname:', __dirname);
        return __dirname;
    }
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        title: 'DM Screen - Campaign Manager',
        icon: path.join(__dirname, 'icons', 'ZuesLogoNoBG.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        backgroundColor: '#1a1510',
        show: false
    });

    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.maximize();

        // Log save folder path for debugging
        const saveFolder = ensureSaveFolder();
        console.log('=== DM Screen Started ===');
        console.log('Save folder location:', saveFolder);
        console.log('Is packaged:', app.isPackaged);
        console.log('========================');
    });

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);
}

// Ensure save folder exists
function ensureSaveFolder() {
    if (!localSaveFolder) {
        localSaveFolder = path.join(getAppDirectory(), 'Saves');
        console.log('Initialized save folder path:', localSaveFolder);
    }
    if (!saveFolderPath) {
        saveFolderPath = localSaveFolder;
    }
    if (!fs.existsSync(saveFolderPath)) {
        console.log('Creating save folder:', saveFolderPath);
        fs.mkdirSync(saveFolderPath, { recursive: true });
    } else {
        console.log('Save folder exists:', saveFolderPath);
    }
    return saveFolderPath;
}

// Get list of save files with metadata
function getSaveFilesWithMetadata() {
    const folder = ensureSaveFolder();
    const files = [];

    try {
        const entries = fs.readdirSync(folder);
        for (const entry of entries) {
            if (entry.endsWith('.json')) {
                const filePath = path.join(folder, entry);
                const stats = fs.statSync(filePath);

                // Try to read campaign name from file
                let campaignName = entry.replace('_save.json', '').replace(/_/g, ' ');
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (data.meta && data.meta.campaignName) {
                        campaignName = data.meta.campaignName;
                    }
                } catch (e) {
                    // Ignore parse errors
                }

                files.push({
                    name: entry,
                    path: filePath,
                    campaignName: campaignName,
                    modified: stats.mtime,
                    size: stats.size
                });
            }
        }
    } catch (e) {
        console.error('Failed to read save folder:', e);
    }

    // Sort by modification time, newest first
    files.sort((a, b) => b.modified - a.modified);
    return files;
}

// IPC Handlers
ipcMain.handle('get-save-folder', () => {
    return ensureSaveFolder();
});

ipcMain.handle('choose-save-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Choose Save Folder',
        defaultPath: saveFolderPath || localSaveFolder,
        properties: ['openDirectory', 'createDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        saveFolderPath = result.filePaths[0];
        return saveFolderPath;
    }
    return null;
});

ipcMain.handle('save-file', async (event, { fileName, data }) => {
    try {
        const folder = ensureSaveFolder();
        const filePath = path.join(folder, fileName);
        fs.writeFileSync(filePath, data, 'utf8');
        return { success: true, path: filePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-file', async (event, fileName) => {
    try {
        const folder = ensureSaveFolder();
        const filePath = path.join(folder, fileName);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return { success: true, data };
        }
        return { success: false, error: 'File not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('list-save-files', async () => {
    try {
        const files = getSaveFilesWithMetadata();
        return { success: true, files };
    } catch (error) {
        return { success: false, error: error.message, files: [] };
    }
});

ipcMain.handle('delete-file', async (event, fileName) => {
    try {
        const folder = ensureSaveFolder();
        const filePath = path.join(folder, fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { success: true };
        }
        return { success: false, error: 'File not found' };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('export-file', async (event, { defaultName, data }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Campaign Data',
        defaultPath: defaultName,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (!result.canceled && result.filePath) {
        try {
            fs.writeFileSync(result.filePath, data, 'utf8');
            return { success: true, path: result.filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Cancelled' };
});

ipcMain.handle('import-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Campaign Data',
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        try {
            const data = fs.readFileSync(result.filePaths[0], 'utf8');
            return { success: true, data, path: result.filePaths[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Cancelled' };
});

// Create new campaign
ipcMain.handle('create-new-campaign', async (event, campaignName) => {
    try {
        const folder = ensureSaveFolder();
        const safeName = campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeName}_save.json`;
        const filePath = path.join(folder, fileName);

        // Don't overwrite existing
        if (fs.existsSync(filePath)) {
            return { success: false, error: 'Campaign with this name already exists' };
        }

        return { success: true, fileName };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Check if we need campaign picker
ipcMain.handle('check-campaigns', async () => {
    const files = getSaveFilesWithMetadata();
    return {
        hasCampaigns: files.length > 0,
        campaigns: files,
        count: files.length
    };
});

// Open folder in file explorer
ipcMain.handle('open-saves-folder', async () => {
    const folder = ensureSaveFolder();
    require('electron').shell.openPath(folder);
    return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
