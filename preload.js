const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Save folder
    getSaveFolder: () => ipcRenderer.invoke('get-save-folder'),
    chooseSaveFolder: () => ipcRenderer.invoke('choose-save-folder'),
    openSavesFolder: () => ipcRenderer.invoke('open-saves-folder'),

    // File operations
    saveFile: (fileName, data) => ipcRenderer.invoke('save-file', { fileName, data }),
    loadFile: (fileName) => ipcRenderer.invoke('load-file', fileName),
    listSaveFiles: () => ipcRenderer.invoke('list-save-files'),
    deleteFile: (fileName) => ipcRenderer.invoke('delete-file', fileName),

    // Campaign management
    checkCampaigns: () => ipcRenderer.invoke('check-campaigns'),
    createNewCampaign: (campaignName) => ipcRenderer.invoke('create-new-campaign', campaignName),

    // Import/Export with dialogs
    exportFile: (defaultName, data) => ipcRenderer.invoke('export-file', { defaultName, data }),
    importFile: () => ipcRenderer.invoke('import-file'),

    // Check if running in Electron
    isElectron: true
});
