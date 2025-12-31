// DM Screen - Data Management Module
// Uses Electron API when available, falls back to File System Access API or localStorage

const DataManager = {
    STORAGE_KEY: 'dm_screen_campaign',
    FOLDER_HANDLE_KEY: 'dm_screen_folder_handle',
    VERSION: '1.2',
    autoSaveInterval: null,
    lastAutoSave: null,
    folderHandle: null,      // Directory handle for saving (browser)
    fileHandle: null,        // Current file handle (browser)
    saveFileName: null,      // Current save file name
    saveFolderPath: null,    // Electron save folder path

    // Check if running in Electron
    isElectron() {
        return window.electronAPI?.isElectron === true;
    },

    // Default data structure
    getDefaultData() {
        return {
            meta: {
                campaignName: 'Untitled Campaign',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                version: this.VERSION
            },
            time: {
                currentDate: { year: 1492, month: 1, day: 1 },
                timeOfDay: 'morning',
                hour: 8,
                calendarConfig: {
                    monthNames: [
                        'Hammer', 'Alturiak', 'Ches', 'Tarsakh', 'Mirtul', 'Kythorn',
                        'Flamerule', 'Eleasis', 'Eleint', 'Marpenoth', 'Uktar', 'Nightal'
                    ],
                    daysPerMonth: 30,
                    monthsPerYear: 12
                },
                lastWeatherChange: null
            },
            weather: {
                current: 'clear',
                temperature: 'mild',
                wind: 'calm',
                precipitation: 'none',
                description: 'Clear skies with mild temperatures.',
                season: 'spring',
                terrain: 'lowlands'
            },
            npcs: [],
            locations: [],
            shops: [],
            quests: [],
            items: [],
            lore: [],
            maps: [],
            party: [],
            sessionNotes: '',
            initiative: {
                combatants: [],
                currentIndex: 0,
                round: 1
            },
            diceHistory: [],
            settings: {
                autoSave: true,
                autoSaveInterval: 5, // minutes
                autoWeather: true,
                weatherChangeHours: 6
            }
        };
    },

    // Current campaign data
    data: null,

    // Check if File System Access API is supported
    isFileSystemSupported() {
        return 'showDirectoryPicker' in window && 'showSaveFilePicker' in window;
    },

    // Initialize data from storage or defaults
    async init() {
        // If running in Electron, try to load from file first
        if (this.isElectron()) {
            await this.initElectron();
        } else {
            // Browser mode - use localStorage
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                try {
                    this.data = JSON.parse(stored);
                    this.migrateData();
                } catch (e) {
                    console.error('Failed to parse stored data:', e);
                    this.data = this.getDefaultData();
                }
            } else {
                this.data = this.getDefaultData();
            }

            // Try to restore folder handle from IndexedDB (browser only)
            await this.restoreFolderHandle();
        }

        // Start auto-save interval
        this.startAutoSave();

        return this.data;
    },

    // Initialize in Electron mode
    async initElectron() {
        try {
            // Get save folder path
            this.saveFolderPath = await window.electronAPI.getSaveFolder();
            console.log('Electron save folder:', this.saveFolderPath);

            // Check for existing campaigns
            const result = await window.electronAPI.checkCampaigns();

            if (result.hasCampaigns) {
                if (result.count === 1) {
                    // Only one campaign, load it automatically
                    const campaign = result.campaigns[0];
                    await this.loadCampaignFile(campaign.name);
                } else {
                    // Multiple campaigns - show picker
                    const selectedFile = await this.showCampaignPicker(result.campaigns);
                    if (selectedFile) {
                        await this.loadCampaignFile(selectedFile);
                    } else {
                        // User cancelled or created new - use default
                        this.data = this.getDefaultData();
                    }
                }
            } else {
                // No campaigns exist - start fresh
                this.data = this.getDefaultData();
            }
        } catch (e) {
            console.error('Electron init failed:', e);
            this.data = this.getDefaultData();
        }
    },

    // Load a specific campaign file
    async loadCampaignFile(fileName) {
        try {
            const loadResult = await window.electronAPI.loadFile(fileName);
            if (loadResult.success) {
                this.data = JSON.parse(loadResult.data);
                this.saveFileName = fileName;
                this.migrateData();
                console.log('Loaded campaign:', fileName);
                return true;
            }
        } catch (e) {
            console.error('Failed to load campaign file:', e);
        }

        // Fallback to default
        this.data = this.getDefaultData();
        return false;
    },

    // Show campaign picker dialog
    async showCampaignPicker(campaigns) {
        return new Promise((resolve) => {
            // Create picker overlay
            const overlay = document.createElement('div');
            overlay.id = 'campaignPickerOverlay';
            overlay.className = 'campaign-picker-overlay';

            const picker = document.createElement('div');
            picker.className = 'campaign-picker';

            picker.innerHTML = `
                <div class="campaign-picker-header">
                    <h2><span class="icon icon-folder-open"></span> Select Campaign</h2>
                </div>
                <div class="campaign-picker-list">
                    ${campaigns.map(c => `
                        <div class="campaign-picker-item" data-file="${c.name}">
                            <div class="campaign-picker-item-info">
                                <div class="campaign-picker-item-name">${c.campaignName}</div>
                                <div class="campaign-picker-item-meta">
                                    Last modified: ${new Date(c.modified).toLocaleString()}
                                </div>
                            </div>
                            <span class="icon icon-chevron-right"></span>
                        </div>
                    `).join('')}
                </div>
                <div class="campaign-picker-actions">
                    <button class="btn" id="newCampaignBtn">
                        <span class="icon icon-add"></span> New Campaign
                    </button>
                    <button class="btn" id="openFolderBtn">
                        <span class="icon icon-folder"></span> Open Saves Folder
                    </button>
                </div>
            `;

            overlay.appendChild(picker);
            document.body.appendChild(overlay);

            // Add styles if not present
            if (!document.getElementById('campaignPickerStyles')) {
                const styles = document.createElement('style');
                styles.id = 'campaignPickerStyles';
                styles.textContent = `
                    .campaign-picker-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                    }
                    .campaign-picker {
                        background: var(--bg-panel);
                        border: 1px solid var(--border);
                        border-radius: var(--radius-lg);
                        width: 500px;
                        max-width: 90vw;
                        max-height: 80vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    }
                    .campaign-picker-header {
                        padding: var(--spacing-lg);
                        border-bottom: 1px solid var(--border);
                    }
                    .campaign-picker-header h2 {
                        display: flex;
                        align-items: center;
                        gap: var(--spacing-sm);
                        margin: 0;
                        color: var(--accent-light);
                    }
                    .campaign-picker-list {
                        flex: 1;
                        overflow-y: auto;
                        padding: var(--spacing-sm);
                    }
                    .campaign-picker-item {
                        display: flex;
                        align-items: center;
                        padding: var(--spacing-md);
                        border-radius: var(--radius-sm);
                        cursor: pointer;
                        transition: background var(--transition-fast);
                    }
                    .campaign-picker-item:hover {
                        background: var(--bg-panel-light);
                    }
                    .campaign-picker-item-info {
                        flex: 1;
                    }
                    .campaign-picker-item-name {
                        font-size: 1.1rem;
                        font-weight: 500;
                        color: var(--text-primary);
                    }
                    .campaign-picker-item-meta {
                        font-size: 0.85rem;
                        color: var(--text-muted);
                        margin-top: var(--spacing-xs);
                    }
                    .campaign-picker-actions {
                        padding: var(--spacing-md);
                        border-top: 1px solid var(--border);
                        display: flex;
                        gap: var(--spacing-sm);
                    }
                `;
                document.head.appendChild(styles);
            }

            // Event handlers
            picker.querySelectorAll('.campaign-picker-item').forEach(item => {
                item.addEventListener('click', () => {
                    overlay.remove();
                    resolve(item.dataset.file);
                });
            });

            picker.querySelector('#newCampaignBtn').addEventListener('click', () => {
                overlay.remove();
                resolve(null); // Will use default data
            });

            picker.querySelector('#openFolderBtn').addEventListener('click', () => {
                window.electronAPI.openSavesFolder();
            });
        });
    },

    // Store folder handle in IndexedDB (localStorage can't store handles)
    async storeFolderHandle(handle) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DMScreenDB', 1);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles');
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction('handles', 'readwrite');
                const store = tx.objectStore('handles');
                store.put(handle, 'folderHandle');
                tx.oncomplete = () => {
                    db.close();
                    resolve();
                };
                tx.onerror = () => reject(tx.error);
            };
        });
    },

    // Restore folder handle from IndexedDB
    async restoreFolderHandle() {
        if (!this.isFileSystemSupported()) return null;

        try {
            const handle = await new Promise((resolve, reject) => {
                const request = indexedDB.open('DMScreenDB', 1);
                request.onerror = () => resolve(null);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('handles')) {
                        db.createObjectStore('handles');
                    }
                };
                request.onsuccess = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains('handles')) {
                        db.close();
                        resolve(null);
                        return;
                    }
                    const tx = db.transaction('handles', 'readonly');
                    const store = tx.objectStore('handles');
                    const getRequest = store.get('folderHandle');
                    getRequest.onsuccess = () => {
                        db.close();
                        resolve(getRequest.result);
                    };
                    getRequest.onerror = () => {
                        db.close();
                        resolve(null);
                    };
                };
            });

            if (handle) {
                // Verify permission
                const permission = await handle.queryPermission({ mode: 'readwrite' });
                if (permission === 'granted') {
                    this.folderHandle = handle;
                    console.log('Restored save folder:', handle.name);
                    return handle;
                }
            }
        } catch (e) {
            console.log('Could not restore folder handle:', e);
        }
        return null;
    },

    // Request permission for folder access (call on user gesture)
    async requestFolderPermission() {
        if (!this.folderHandle) return false;

        try {
            const permission = await this.folderHandle.requestPermission({ mode: 'readwrite' });
            return permission === 'granted';
        } catch (e) {
            console.error('Permission request failed:', e);
            return false;
        }
    },

    // Choose a folder to save to
    async chooseSaveFolder() {
        if (!this.isFileSystemSupported()) {
            if (typeof UI !== 'undefined') {
                UI.showToast('File System API not supported in this browser', 'error');
            }
            return null;
        }

        try {
            const handle = await window.showDirectoryPicker({
                id: 'dm-screen-saves',
                mode: 'readwrite',
                startIn: 'documents'
            });

            this.folderHandle = handle;
            await this.storeFolderHandle(handle);

            // Create a campaign-specific file name
            this.saveFileName = this.getSaveFileName();

            if (typeof UI !== 'undefined') {
                UI.showToast(`Save folder set: ${handle.name}`, 'success');
            }

            console.log('Save folder selected:', handle.name);
            return handle;
        } catch (e) {
            if (e.name !== 'AbortError') {
                console.error('Failed to choose folder:', e);
            }
            return null;
        }
    },

    // Get save file name based on campaign
    getSaveFileName() {
        const safeName = (this.data.meta.campaignName || 'campaign')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
        return `${safeName}_save.json`;
    },

    // Migrate data from older versions
    migrateData() {
        if (!this.data.meta) {
            this.data.meta = this.getDefaultData().meta;
        }
        if (!this.data.initiative) {
            this.data.initiative = this.getDefaultData().initiative;
        }
        if (!this.data.diceHistory) {
            this.data.diceHistory = [];
        }
        if (!this.data.weather) {
            this.data.weather = this.getDefaultData().weather;
        }
        if (!this.data.weather.terrain) {
            this.data.weather.terrain = 'lowlands';
        }
        if (!this.data.time.hour) {
            this.data.time.hour = 8;
        }
        if (!this.data.settings) {
            this.data.settings = this.getDefaultData().settings;
        }
        if (!this.data.settings.autoSaveInterval) {
            this.data.settings.autoSaveInterval = 5;
        }
        // Ensure all entity arrays exist
        const entityTypes = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore', 'maps', 'party'];
        entityTypes.forEach(type => {
            if (!this.data[type]) {
                this.data[type] = [];
            }
        });
    },

    // Start auto-save to file
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        const minutes = this.data?.settings?.autoSaveInterval || 5;
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveToFile();
        }, minutes * 60 * 1000);

        console.log(`Auto-save started: every ${minutes} minutes`);
    },

    // Auto-save to file (uses folder if set, otherwise localStorage only)
    async autoSaveToFile() {
        if (!this.data?.settings?.autoSave) return;

        // Always save to localStorage as backup
        this.save();

        // Electron mode - save to file
        if (this.isElectron()) {
            const success = await this.saveToElectron();
            if (success) {
                this.lastAutoSave = new Date();
                console.log('Auto-saved to file at', this.lastAutoSave.toLocaleTimeString());
                if (typeof UI !== 'undefined') {
                    UI.showToast('Auto-saved', 'success', 2000);
                }
                return;
            }
        }
        // Browser mode with folder set
        else if (this.folderHandle) {
            const success = await this.saveToFolder();
            if (success) {
                this.lastAutoSave = new Date();
                console.log('Auto-saved to folder at', this.lastAutoSave.toLocaleTimeString());
                if (typeof UI !== 'undefined') {
                    UI.showToast('Auto-saved', 'success', 2000);
                }
                return;
            }
        }

        // Fallback: just localStorage (already done above)
        this.lastAutoSave = new Date();
        console.log('Auto-saved to localStorage at', this.lastAutoSave.toLocaleTimeString());
    },

    // Save using Electron API
    async saveToElectron(showToast = false) {
        if (!this.isElectron()) return false;

        try {
            const fileName = this.getSaveFileName();
            const data = JSON.stringify(this.data, null, 2);
            const result = await window.electronAPI.saveFile(fileName, data);

            if (result.success) {
                this.saveFileName = fileName;
                if (showToast && typeof UI !== 'undefined') {
                    UI.showToast(`Saved to ${fileName}`, 'success');
                }
                return true;
            } else {
                console.error('Electron save failed:', result.error);
                if (typeof UI !== 'undefined') {
                    UI.showToast('Save failed: ' + result.error, 'error');
                }
                return false;
            }
        } catch (e) {
            console.error('Electron save error:', e);
            return false;
        }
    },

    // Save directly to the chosen folder
    async saveToFolder(showToast = false) {
        if (!this.folderHandle) {
            if (showToast && typeof UI !== 'undefined') {
                UI.showToast('No save folder set. Click "Set Save Folder" first.', 'warning');
            }
            return false;
        }

        try {
            // Check/request permission
            const permission = await this.folderHandle.queryPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                const requested = await this.folderHandle.requestPermission({ mode: 'readwrite' });
                if (requested !== 'granted') {
                    if (typeof UI !== 'undefined') {
                        UI.showToast('Permission denied to save folder', 'error');
                    }
                    return false;
                }
            }

            // Get or create the save file
            const fileName = this.getSaveFileName();
            const fileHandle = await this.folderHandle.getFileHandle(fileName, { create: true });

            // Write data
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(this.data, null, 2));
            await writable.close();

            this.fileHandle = fileHandle;
            this.saveFileName = fileName;

            if (showToast && typeof UI !== 'undefined') {
                UI.showToast(`Saved to ${fileName}`, 'success');
            }

            return true;
        } catch (e) {
            console.error('Failed to save to folder:', e);
            if (typeof UI !== 'undefined') {
                UI.showToast('Failed to save: ' + e.message, 'error');
            }
            return false;
        }
    },

    // Load from the chosen folder
    async loadFromFolder() {
        if (!this.folderHandle) {
            if (typeof UI !== 'undefined') {
                UI.showToast('No save folder set', 'warning');
            }
            return false;
        }

        try {
            const fileName = this.getSaveFileName();
            const fileHandle = await this.folderHandle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const contents = await file.text();

            const result = this.importJSON(contents);
            if (result.success) {
                this.fileHandle = fileHandle;
                if (typeof UI !== 'undefined') {
                    UI.showToast(`Loaded from ${fileName}`, 'success');
                }
                return true;
            } else {
                if (typeof UI !== 'undefined') {
                    UI.showToast('Failed to parse save file', 'error');
                }
                return false;
            }
        } catch (e) {
            if (e.name === 'NotFoundError') {
                if (typeof UI !== 'undefined') {
                    UI.showToast('No save file found in folder', 'info');
                }
            } else {
                console.error('Failed to load from folder:', e);
                if (typeof UI !== 'undefined') {
                    UI.showToast('Failed to load: ' + e.message, 'error');
                }
            }
            return false;
        }
    },

    // List save files in folder
    async listSaveFiles() {
        if (!this.folderHandle) return [];

        try {
            const files = [];
            for await (const entry of this.folderHandle.values()) {
                if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                    files.push(entry.name);
                }
            }
            return files.sort();
        } catch (e) {
            console.error('Failed to list files:', e);
            return [];
        }
    },

    // Load a specific file from folder
    async loadFile(fileName) {
        if (!this.folderHandle) return false;

        try {
            const fileHandle = await this.folderHandle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            const contents = await file.text();

            const result = this.importJSON(contents);
            if (result.success) {
                this.fileHandle = fileHandle;
                this.saveFileName = fileName;
                if (typeof UI !== 'undefined') {
                    UI.showToast(`Loaded ${fileName}`, 'success');
                }
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to load file:', e);
            return false;
        }
    },

    // Get folder status for UI
    getFolderStatus() {
        if (this.isElectron()) {
            return {
                hasFolder: true,
                folderName: this.saveFolderPath ? this.saveFolderPath.split(/[\\/]/).pop() : 'DM Screen Saves',
                folderPath: this.saveFolderPath,
                fileName: this.saveFileName || this.getSaveFileName(),
                isSupported: true,
                isElectron: true
            };
        }
        return {
            hasFolder: !!this.folderHandle,
            folderName: this.folderHandle?.name || null,
            fileName: this.saveFileName || this.getSaveFileName(),
            isSupported: this.isFileSystemSupported(),
            isElectron: false
        };
    },

    // Save data to localStorage
    save() {
        this.data.meta.lastModified = new Date().toISOString();
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.error('Failed to save data:', e);
            return false;
        }
    },

    // Export data as JSON file (download)
    exportJSON(isAutoSave = false) {
        const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
        const prefix = isAutoSave ? 'autosave_' : '';
        a.download = `${prefix}${this.data.meta.campaignName.replace(/[^a-z0-9]/gi, '_')}_${timestamp[0]}_${timestamp[1].substring(0, 8)}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Manual save to file (uses folder if set, otherwise downloads)
    async manualSaveToFile() {
        this.save();

        // Electron mode
        if (this.isElectron()) {
            await this.saveToElectron(true);
        }
        // Browser with folder set
        else if (this.folderHandle) {
            await this.saveToFolder(true);
        }
        // Fallback to download
        else {
            this.exportJSON(false);
            if (typeof UI !== 'undefined') {
                UI.showToast('Downloaded save file', 'success');
            }
        }
    },

    // List save files (Electron mode)
    async listSaveFilesElectron() {
        if (!this.isElectron()) return [];

        try {
            const result = await window.electronAPI.listSaveFiles();
            return result.success ? result.files : [];
        } catch (e) {
            console.error('Failed to list save files:', e);
            return [];
        }
    },

    // Load a specific file (Electron mode)
    async loadFileElectron(fileName) {
        if (!this.isElectron()) return false;

        try {
            const result = await window.electronAPI.loadFile(fileName);
            if (result.success) {
                const imported = JSON.parse(result.data);
                this.data = imported;
                this.migrateData();
                this.saveFileName = fileName;
                this.save(); // Update localStorage too
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to load file:', e);
            return false;
        }
    },

    // Export with dialog (Electron mode)
    async exportWithDialog() {
        if (!this.isElectron()) {
            this.exportJSON(false);
            return;
        }

        const defaultName = `${this.data.meta.campaignName.replace(/[^a-z0-9]/gi, '_')}_export.json`;
        const data = JSON.stringify(this.data, null, 2);
        const result = await window.electronAPI.exportFile(defaultName, data);

        if (result.success && typeof UI !== 'undefined') {
            UI.showToast('Exported successfully', 'success');
        }
    },

    // Import with dialog (Electron mode)
    async importWithDialog() {
        if (!this.isElectron()) return null;

        const result = await window.electronAPI.importFile();
        if (result.success) {
            return result.data;
        }
        return null;
    },

    // Import data from JSON file
    importJSON(jsonString, options = { merge: false }) {
        try {
            const imported = JSON.parse(jsonString);

            if (options.merge) {
                const entityTypes = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore', 'maps'];
                entityTypes.forEach(type => {
                    if (imported[type] && Array.isArray(imported[type])) {
                        const existingIds = new Set(this.data[type].map(e => e.id));
                        imported[type].forEach(entity => {
                            if (!existingIds.has(entity.id)) {
                                this.data[type].push(entity);
                            }
                        });
                    }
                });
            } else {
                this.data = imported;
                this.migrateData();
            }

            this.save();
            this.startAutoSave(); // Restart with potentially new interval
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Clear all data
    clearAll() {
        this.data = this.getDefaultData();
        this.save();
    },

    // Generate UUID
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // CRUD operations for entities
    createEntity(type, data) {
        const entity = {
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data
        };
        this.data[type].push(entity);
        this.save();
        return entity;
    },

    updateEntity(type, id, data) {
        const index = this.data[type].findIndex(e => e.id === id);
        if (index !== -1) {
            this.data[type][index] = {
                ...this.data[type][index],
                ...data,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.data[type][index];
        }
        return null;
    },

    deleteEntity(type, id) {
        const index = this.data[type].findIndex(e => e.id === id);
        if (index !== -1) {
            this.data[type].splice(index, 1);
            this.cleanupReferences(type, id);
            this.save();
            return true;
        }
        return false;
    },

    getEntity(type, id) {
        return this.data[type].find(e => e.id === id);
    },

    getAllEntities(type) {
        return this.data[type] || [];
    },

    // Search entities
    searchEntities(type, query, filters = {}) {
        let entities = this.data[type] || [];

        if (query) {
            const lowerQuery = query.toLowerCase();
            entities = entities.filter(e => {
                const searchFields = ['name', 'title', 'description', 'notes', 'content'];
                return searchFields.some(field =>
                    e[field] && e[field].toLowerCase().includes(lowerQuery)
                );
            });
        }

        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                entities = entities.filter(e => e[key] === filters[key]);
            }
        });

        return entities;
    },

    // Global search across all entity types
    globalSearch(query) {
        if (!query) return [];

        const results = [];
        const types = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore'];
        const lowerQuery = query.toLowerCase();

        types.forEach(type => {
            const entities = this.data[type] || [];
            entities.forEach(entity => {
                const name = entity.name || entity.title || '';
                if (name.toLowerCase().includes(lowerQuery)) {
                    results.push({ type, entity, matchField: 'name' });
                } else if (entity.description && entity.description.toLowerCase().includes(lowerQuery)) {
                    results.push({ type, entity, matchField: 'description' });
                }
            });
        });

        return results;
    },

    // Get entities linked to a specific entity
    getLinkedEntities(type, id) {
        const entity = this.getEntity(type, id);
        if (!entity) return {};

        const linked = {};

        // Define which fields link to which entity types
        const linkMappings = {
            npcs: ['locationIds', 'questIds', 'shopId'],
            locations: ['npcIds', 'shopIds', 'questIds', 'parentLocationId'],
            shops: ['locationId', 'ownerId', 'staffIds', 'questIds'],
            quests: ['giverNpcId', 'npcIds', 'locationIds', 'prerequisiteIds', 'itemRewardIds'],
            items: ['questIds'],
            lore: ['relatedNpcIds', 'relatedLocationIds', 'relatedQuestIds']
        };

        const entityLinks = linkMappings[type] || [];
        entityLinks.forEach(field => {
            if (entity[field]) {
                const ids = Array.isArray(entity[field]) ? entity[field] : [entity[field]];
                const targetType = this.getTypeFromField(field);
                if (targetType) {
                    const linkedEntities = ids.map(id => this.getEntity(targetType, id)).filter(Boolean);
                    if (linkedEntities.length > 0) {
                        if (!linked[targetType]) linked[targetType] = [];
                        linked[targetType].push(...linkedEntities);
                    }
                }
            }
        });

        const reverseLinks = this.findReverseLinks(type, id);
        Object.keys(reverseLinks).forEach(linkType => {
            if (!linked[linkType]) linked[linkType] = [];
            // Avoid duplicates
            reverseLinks[linkType].forEach(e => {
                if (!linked[linkType].find(existing => existing.id === e.id)) {
                    linked[linkType].push(e);
                }
            });
        });

        return linked;
    },

    getTypeFromField(field) {
        const mappings = {
            'locationIds': 'locations',
            'locationId': 'locations',
            'parentLocationId': 'locations',
            'relatedLocationIds': 'locations',
            'questIds': 'quests',
            'questId': 'quests',
            'prerequisiteIds': 'quests',
            'relatedQuestIds': 'quests',
            'npcIds': 'npcs',
            'giverNpcId': 'npcs',
            'ownerId': 'npcs',
            'staffIds': 'npcs',
            'relatedNpcIds': 'npcs',
            'shopIds': 'shops',
            'shopId': 'shops',
            'itemIds': 'items',
            'itemRewardIds': 'items'
        };
        return mappings[field];
    },

    findReverseLinks(type, id) {
        const reverseLinks = {};
        const typesToCheck = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore'];

        typesToCheck.forEach(checkType => {
            if (checkType === type) return;

            const entities = this.data[checkType] || [];
            const linked = entities.filter(e => {
                return Object.values(e).some(val => {
                    if (Array.isArray(val)) return val.includes(id);
                    return val === id;
                });
            });

            if (linked.length > 0) {
                if (!reverseLinks[checkType]) reverseLinks[checkType] = [];
                reverseLinks[checkType].push(...linked);
            }
        });

        return reverseLinks;
    },

    cleanupReferences(deletedType, deletedId) {
        const typesToCheck = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore', 'maps'];

        typesToCheck.forEach(type => {
            this.data[type].forEach(entity => {
                Object.keys(entity).forEach(key => {
                    if (Array.isArray(entity[key])) {
                        entity[key] = entity[key].filter(id => id !== deletedId);
                    } else if (entity[key] === deletedId) {
                        entity[key] = null;
                    }
                });
            });
        });
    },

    // Time management
    advanceTime(amount, unit) {
        const { currentDate, calendarConfig } = this.data.time;
        const oldHour = this.data.time.hour;
        let hoursAdvanced = 0;

        switch (unit) {
            case 'hours':
                hoursAdvanced = amount;
                this.data.time.hour += amount;
                while (this.data.time.hour >= 24) {
                    this.data.time.hour -= 24;
                    this.advanceTime(1, 'days');
                }
                this.updateTimeOfDay();
                break;
            case 'days':
                hoursAdvanced = amount * 24;
                currentDate.day += amount;
                while (currentDate.day > calendarConfig.daysPerMonth) {
                    currentDate.day -= calendarConfig.daysPerMonth;
                    currentDate.month++;
                    if (currentDate.month > calendarConfig.monthsPerYear) {
                        currentDate.month = 1;
                        currentDate.year++;
                    }
                }
                this.updateSeason();
                break;
            case 'weeks':
                this.advanceTime(amount * 7, 'days');
                return this.data.time;
            case 'months':
                hoursAdvanced = amount * 30 * 24;
                currentDate.month += amount;
                while (currentDate.month > calendarConfig.monthsPerYear) {
                    currentDate.month -= calendarConfig.monthsPerYear;
                    currentDate.year++;
                }
                this.updateSeason();
                break;
        }

        // Check for weather change
        if (this.data.settings.autoWeather && hoursAdvanced > 0) {
            this.checkWeatherChange(hoursAdvanced);
        }

        this.save();
        return this.data.time;
    },

    updateTimeOfDay() {
        const hour = this.data.time.hour;
        if (hour >= 5 && hour < 8) this.data.time.timeOfDay = 'dawn';
        else if (hour >= 8 && hour < 12) this.data.time.timeOfDay = 'morning';
        else if (hour >= 12 && hour < 14) this.data.time.timeOfDay = 'midday';
        else if (hour >= 14 && hour < 17) this.data.time.timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 20) this.data.time.timeOfDay = 'evening';
        else if (hour >= 20 && hour < 22) this.data.time.timeOfDay = 'dusk';
        else if (hour >= 22 || hour < 1) this.data.time.timeOfDay = 'night';
        else this.data.time.timeOfDay = 'midnight';
    },

    updateSeason() {
        const month = this.data.time.currentDate.month;
        if (month >= 3 && month <= 5) this.data.weather.season = 'spring';
        else if (month >= 6 && month <= 8) this.data.weather.season = 'summer';
        else if (month >= 9 && month <= 11) this.data.weather.season = 'autumn';
        else this.data.weather.season = 'winter';
    },

    setTime(date, timeOfDay, hour) {
        if (date) {
            this.data.time.currentDate = date;
            this.updateSeason();
        }
        if (hour !== undefined) {
            this.data.time.hour = hour;
            this.updateTimeOfDay();
        } else if (timeOfDay) {
            this.data.time.timeOfDay = timeOfDay;
            // Set approximate hour based on time of day
            const hourMap = { dawn: 6, morning: 9, midday: 12, afternoon: 15, evening: 18, dusk: 20, night: 22, midnight: 0 };
            this.data.time.hour = hourMap[timeOfDay] || 12;
        }
        this.save();
        return this.data.time;
    },

    getFormattedDate() {
        const { currentDate, calendarConfig } = this.data.time;
        const monthName = calendarConfig.monthNames[currentDate.month - 1] || `Month ${currentDate.month}`;
        return `${currentDate.day} ${monthName}, ${currentDate.year}`;
    },

    getFormattedTime() {
        const hour = this.data.time.hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    },

    getMoonPhase() {
        const { currentDate } = this.data.time;
        const totalDays = (currentDate.year * 360) + (currentDate.month * 30) + currentDate.day;
        const phaseDay = totalDays % 30;

        if (phaseDay < 4) return { name: 'New Moon', phase: 'new' };
        if (phaseDay < 8) return { name: 'Waxing Crescent', phase: 'waxing-crescent' };
        if (phaseDay < 12) return { name: 'First Quarter', phase: 'first-quarter' };
        if (phaseDay < 16) return { name: 'Waxing Gibbous', phase: 'waxing-gibbous' };
        if (phaseDay < 19) return { name: 'Full Moon', phase: 'full' };
        if (phaseDay < 23) return { name: 'Waning Gibbous', phase: 'waning-gibbous' };
        if (phaseDay < 27) return { name: 'Last Quarter', phase: 'last-quarter' };
        return { name: 'Waning Crescent', phase: 'waning-crescent' };
    },

    // Weather System (Central European/German climate)
    checkWeatherChange(hoursAdvanced) {
        const changeInterval = this.data.settings.weatherChangeHours || 6;
        const lastChange = this.data.time.lastWeatherChange || 0;
        const totalHours = lastChange + hoursAdvanced;

        if (totalHours >= changeInterval) {
            this.generateWeather();
            this.data.time.lastWeatherChange = 0;
        } else {
            this.data.time.lastWeatherChange = totalHours;
        }
    },

    generateWeather() {
        const season = this.data.weather.season;
        const terrain = this.data.weather.terrain || 'lowlands';
        const weather = this.data.weather;

        // Base seasonal weather patterns (Central European)
        const seasonPatterns = {
            spring: {
                conditions: ['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'rain', 'thunderstorm', 'fog'],
                weights:    [15,      25,              20,       20,           12,     5,             3],
                tempRange: { min: 5, max: 18 },
                tempDescriptions: { cold: [0, 8], cool: [8, 12], mild: [12, 16], warm: [16, 22] }
            },
            summer: {
                conditions: ['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'rain', 'thunderstorm', 'heatwave'],
                weights:    [30,      30,              15,       10,           8,      5,              2],
                tempRange: { min: 15, max: 32 },
                tempDescriptions: { mild: [12, 18], warm: [18, 24], hot: [24, 30], sweltering: [30, 40] }
            },
            autumn: {
                conditions: ['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'rain', 'fog', 'drizzle', 'windy'],
                weights:    [10,      20,              25,       18,           15,     5,     5,         2],
                tempRange: { min: 3, max: 16 },
                tempDescriptions: { cold: [0, 6], cool: [6, 10], mild: [10, 14], warm: [14, 20] }
            },
            winter: {
                conditions: ['clear', 'partly_cloudy', 'cloudy', 'light_snow', 'snow', 'sleet', 'fog', 'freezing_rain'],
                weights:    [15,      15,              25,       15,           15,     8,       5,     2],
                tempRange: { min: -8, max: 6 },
                tempDescriptions: { freezing: [-15, -5], cold: [-5, 0], chilly: [0, 4], cool: [4, 10] }
            }
        };

        // Terrain modifiers
        const terrainModifiers = {
            'tomber_ranges': {
                // Mountains - colder, more wind, snow at higher elevations
                tempMod: -8,
                windBonus: 20, // % chance to increase wind
                specialConditions: { 'snow': 15, 'light_snow': 10, 'fog': 5 },
                description: 'in the Tomber Ranges'
            },
            'arodens_stand': {
                // Eastern mountains
                tempMod: -6,
                windBonus: 15,
                specialConditions: { 'snow': 10, 'light_snow': 8, 'clear': 10 },
                description: 'in Aroden\'s Stand'
            },
            'old_deadwood': {
                // Corrupted forest - unnatural weather, fog, gloom
                tempMod: -2,
                windBonus: -10,
                specialConditions: { 'fog': 25, 'cloudy': 15, 'drizzle': 10 },
                description: 'in the Old Deadwood'
            },
            'skyless_waste': {
                // Badlands - extreme temps, dust, harsh
                tempMod: 4,
                windBonus: 25,
                specialConditions: { 'dust_storm': 15, 'clear': 10, 'heatwave': 10 },
                description: 'in the Skyless Waste'
            },
            'ironsand_vale': {
                // Forested valley - moderate, sheltered
                tempMod: 0,
                windBonus: -15,
                specialConditions: { 'fog': 8, 'light_rain': 5 },
                description: 'in Ironsand Vale'
            },
            'britevold_forest': {
                // Dense forest - sheltered, humid
                tempMod: -1,
                windBonus: -20,
                specialConditions: { 'fog': 10, 'drizzle': 8, 'light_rain': 5 },
                description: 'in Britevold Forest'
            },
            'concordance_bay': {
                // Coastal - moderate, sea breezes, fog
                tempMod: 2,
                windBonus: 10,
                specialConditions: { 'fog': 15, 'light_rain': 8, 'drizzle': 5 },
                description: 'along Concordance Bay'
            },
            'starfall_lake': {
                // Lake region - humid, fog, moderate
                tempMod: 1,
                windBonus: 5,
                specialConditions: { 'fog': 20, 'mist': 10, 'light_rain': 5 },
                description: 'near Starfall Lake'
            },
            'lowlands': {
                // Default central lowlands
                tempMod: 0,
                windBonus: 0,
                specialConditions: {},
                description: 'in the lowlands'
            },
            'river_valley': {
                // River areas
                tempMod: 0,
                windBonus: -5,
                specialConditions: { 'fog': 12, 'mist': 8 },
                description: 'in the river valley'
            }
        };

        const terrainMod = terrainModifiers[terrain] || terrainModifiers['lowlands'];
        const pattern = { ...seasonPatterns[season] };

        // Apply terrain special conditions (boost certain weather types)
        let modifiedWeights = [...pattern.weights];
        for (const [condition, bonus] of Object.entries(terrainMod.specialConditions)) {
            const idx = pattern.conditions.indexOf(condition);
            if (idx !== -1) {
                modifiedWeights[idx] += bonus;
            } else if (condition === 'dust_storm' && terrain === 'skyless_waste') {
                // Add dust storm for wasteland
                pattern.conditions.push('dust_storm');
                modifiedWeights.push(bonus);
            } else if (condition === 'mist') {
                const fogIdx = pattern.conditions.indexOf('fog');
                if (fogIdx !== -1) modifiedWeights[fogIdx] += bonus;
            }
        }

        // Select weather condition based on modified weights
        let totalWeight = modifiedWeights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let conditionIndex = 0;
        for (let i = 0; i < modifiedWeights.length; i++) {
            random -= modifiedWeights[i];
            if (random <= 0) {
                conditionIndex = i;
                break;
            }
        }

        weather.current = pattern.conditions[conditionIndex];

        // Temperature with terrain modifier
        const baseTemp = Math.floor(Math.random() * (pattern.tempRange.max - pattern.tempRange.min + 1)) + pattern.tempRange.min;
        const temp = baseTemp + terrainMod.tempMod;

        for (const [desc, range] of Object.entries(pattern.tempDescriptions)) {
            if (temp >= range[0] && temp < range[1]) {
                weather.temperature = desc;
                break;
            }
        }
        // Handle temps outside normal ranges
        if (temp < -10) weather.temperature = 'freezing';
        else if (temp >= 30) weather.temperature = 'sweltering';

        weather.temperatureValue = temp;

        // Wind with terrain modifier
        const winds = ['calm', 'light_breeze', 'moderate', 'strong', 'gale'];
        let windWeights = weather.current === 'windy' || weather.current === 'dust_storm'
            ? [0, 5, 20, 50, 25]
            : [30, 35, 25, 8, 2];

        // Apply terrain wind bonus
        if (terrainMod.windBonus > 0) {
            // Shift weights toward stronger winds
            windWeights = windWeights.map((w, i) => i >= 2 ? w + terrainMod.windBonus/2 : Math.max(0, w - terrainMod.windBonus/4));
        } else if (terrainMod.windBonus < 0) {
            // Shift weights toward calmer winds
            windWeights = windWeights.map((w, i) => i <= 1 ? w - terrainMod.windBonus/2 : Math.max(0, w + terrainMod.windBonus/4));
        }

        totalWeight = windWeights.reduce((a, b) => a + b, 0);
        random = Math.random() * totalWeight;
        let windIndex = 0;
        for (let i = 0; i < windWeights.length; i++) {
            random -= windWeights[i];
            if (random <= 0) {
                windIndex = i;
                break;
            }
        }
        weather.wind = winds[windIndex];

        // Precipitation
        const precipMap = {
            'clear': 'none', 'partly_cloudy': 'none', 'cloudy': 'none', 'heatwave': 'none', 'windy': 'none',
            'fog': 'mist', 'drizzle': 'light_rain', 'dust_storm': 'none',
            'light_rain': 'light_rain', 'rain': 'rain', 'thunderstorm': 'heavy_rain',
            'light_snow': 'light_snow', 'snow': 'snow', 'sleet': 'sleet', 'freezing_rain': 'freezing_rain'
        };
        weather.precipitation = precipMap[weather.current] || 'none';

        // Generate description
        weather.description = this.generateWeatherDescription();

        this.save();
        return weather;
    },

    generateWeatherDescription() {
        const w = this.data.weather;
        const parts = [];

        const conditionDesc = {
            'clear': 'Clear skies',
            'partly_cloudy': 'Partly cloudy',
            'cloudy': 'Overcast skies',
            'light_rain': 'Light rain falling',
            'rain': 'Steady rain',
            'thunderstorm': 'Thunderstorms with lightning',
            'fog': 'Thick fog blankets the area',
            'drizzle': 'A light drizzle',
            'light_snow': 'Light snowfall',
            'snow': 'Heavy snow falling',
            'sleet': 'Sleet and freezing rain',
            'freezing_rain': 'Dangerous freezing rain',
            'heatwave': 'Oppressive heat',
            'windy': 'Strong winds',
            'dust_storm': 'A choking dust storm'
        };

        parts.push(conditionDesc[w.current] || 'Variable conditions');

        const tempDesc = {
            'freezing': 'with freezing temperatures',
            'cold': 'and cold',
            'chilly': 'with a chill in the air',
            'cool': 'and cool',
            'mild': 'with mild temperatures',
            'warm': 'and warm',
            'hot': 'with hot temperatures',
            'sweltering': 'and sweltering heat'
        };

        if (tempDesc[w.temperature]) {
            parts.push(tempDesc[w.temperature]);
        }

        if (w.temperatureValue !== undefined) {
            parts.push(`(${w.temperatureValue}°C)`);
        }

        // Terrain descriptions
        const terrainDesc = {
            'tomber_ranges': 'in the Tomber Ranges',
            'arodens_stand': 'in Aroden\'s Stand',
            'old_deadwood': 'in the Old Deadwood',
            'skyless_waste': 'across the Skyless Waste',
            'ironsand_vale': 'in Ironsand Vale',
            'britevold_forest': 'in Britevold Forest',
            'concordance_bay': 'along Concordance Bay',
            'starfall_lake': 'near Starfall Lake',
            'lowlands': 'in the lowlands',
            'river_valley': 'in the river valley'
        };

        if (w.terrain && terrainDesc[w.terrain]) {
            parts.push(terrainDesc[w.terrain] + '.');
        }

        const windDesc = {
            'calm': '',
            'light_breeze': 'A light breeze blows.',
            'moderate': 'Moderate winds.',
            'strong': 'Strong winds make travel difficult.',
            'gale': 'Gale-force winds are dangerous!'
        };

        if (windDesc[w.wind]) {
            parts.push(windDesc[w.wind]);
        }

        return parts.join(' ').trim();
    },

    setWeather(weatherData) {
        Object.assign(this.data.weather, weatherData);
        this.data.weather.description = this.generateWeatherDescription();
        this.save();
        return this.data.weather;
    },

    getWeatherIcon() {
        // Returns the weather condition key for use with CSS icon classes
        return this.data.weather.current || 'clear';
    },

    // Campaign metadata
    setCampaignName(name) {
        this.data.meta.campaignName = name;
        this.save();
    },

    setSessionNotes(notes) {
        this.data.sessionNotes = notes;
        this.save();
    },

    updateParty(party) {
        this.data.party = party;
        this.save();
    },

    updateInitiative(initiative) {
        this.data.initiative = initiative;
        this.save();
    },

    addDiceRoll(roll) {
        this.data.diceHistory.unshift({
            ...roll,
            timestamp: new Date().toISOString()
        });
        if (this.data.diceHistory.length > 50) {
            this.data.diceHistory = this.data.diceHistory.slice(0, 50);
        }
        this.save();
    },

    // Settings
    updateSettings(settings) {
        Object.assign(this.data.settings, settings);
        this.save();
        this.startAutoSave(); // Restart with new interval if changed
    }
};

// Note: DataManager.init() is called from App.init() to ensure proper async handling