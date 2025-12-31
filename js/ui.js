// DM Screen - UI Module

const UI = {
    currentTab: 'dashboard',
    modalStack: [],

    init() {
        this.setupNavigation();
        this.setupModal();
        this.setupQuickSearch();
        this.setupToasts();
        this.setupKeyboardShortcuts();
        this.updateTimeDisplay();
        this.setupSaveButtons();
    },

    setupNavigation() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    },

    switchTab(tabId) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
        this.currentTab = tabId;
        if (typeof window[`init${tabId.charAt(0).toUpperCase() + tabId.slice(1)}Tab`] === 'function') {
            window[`init${tabId.charAt(0).toUpperCase() + tabId.slice(1)}Tab`]();
        }
    },

    setupModal() {
        const overlay = document.getElementById('modalOverlay');
        const closeBtn = document.getElementById('modalClose');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
        closeBtn.addEventListener('click', () => this.closeModal());
    },

    openModal(options) {
        const { title, content, footer, size, onClose } = options;
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modal');
        const titleEl = document.getElementById('modalTitle');
        const bodyEl = document.getElementById('modalBody');
        const footerEl = document.getElementById('modalFooter');

        titleEl.textContent = title || '';
        bodyEl.innerHTML = '';
        footerEl.innerHTML = '';

        if (typeof content === 'string') {
            bodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyEl.appendChild(content);
        }

        if (footer) {
            if (typeof footer === 'string') {
                footerEl.innerHTML = footer;
            } else if (footer instanceof HTMLElement) {
                footerEl.appendChild(footer);
            }
        }

        modal.classList.toggle('modal-large', size === 'large');
        this.modalStack.push({ onClose });
        overlay.classList.add('active');

        setTimeout(() => {
            const firstInput = bodyEl.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    closeModal() {
        const overlay = document.getElementById('modalOverlay');
        const stackItem = this.modalStack.pop();
        if (stackItem && stackItem.onClose) stackItem.onClose();
        if (this.modalStack.length === 0) overlay.classList.remove('active');
    },

    confirm(message, onConfirm, onCancel) {
        const content = document.createElement('div');
        content.className = 'confirm-dialog';
        content.innerHTML = `
            <p class="confirm-dialog-message">${Utils.escapeHtml(message)}</p>
            <div class="confirm-dialog-actions">
                <button class="btn btn-danger" id="confirmYes">Yes</button>
                <button class="btn" id="confirmNo">Cancel</button>
            </div>
        `;
        this.openModal({ title: 'Confirm', content, onClose: onCancel });
        content.querySelector('#confirmYes').addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
        });
        content.querySelector('#confirmNo').addEventListener('click', () => {
            this.closeModal();
            if (onCancel) onCancel();
        });
    },

    setupQuickSearch() {
        const overlay = document.getElementById('quickSearchOverlay');
        const input = document.getElementById('quickSearchInput');
        const results = document.getElementById('quickSearchResults');
        const btn = document.getElementById('quickSearchBtn');

        btn.addEventListener('click', () => this.openQuickSearch());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeQuickSearch();
        });

        input.addEventListener('input', Utils.debounce(() => {
            this.updateQuickSearchResults(input.value);
        }, 200));

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeQuickSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectNextSearchResult(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectNextSearchResult(-1);
            } else if (e.key === 'Enter') {
                const selected = results.querySelector('.selected');
                if (selected) selected.click();
            }
        });
    },

    openQuickSearch() {
        const overlay = document.getElementById('quickSearchOverlay');
        const input = document.getElementById('quickSearchInput');
        overlay.classList.add('active');
        input.value = '';
        input.focus();
        this.updateQuickSearchResults('');
    },

    closeQuickSearch() {
        document.getElementById('quickSearchOverlay').classList.remove('active');
    },

    updateQuickSearchResults(query) {
        const results = document.getElementById('quickSearchResults');
        results.innerHTML = '';

        if (!query) {
            results.innerHTML = '<div class="quick-search-result text-muted" style="justify-content: center;">Type to search...</div>';
            return;
        }

        const searchResults = DataManager.globalSearch(query);

        if (searchResults.length === 0) {
            results.innerHTML = '<div class="quick-search-result text-muted" style="justify-content: center;">No results found</div>';
            return;
        }

        searchResults.slice(0, 10).forEach((result, index) => {
            const div = document.createElement('div');
            div.className = 'quick-search-result' + (index === 0 ? ' selected' : '');
            div.innerHTML = `
                <span class="quick-search-result-type"><i class="icon icon-${result.type}"></i> ${Utils.getEntityTypeName(result.type, true)}</span>
                <span class="quick-search-result-name">${Utils.escapeHtml(result.entity.name || result.entity.title)}</span>
            `;
            div.addEventListener('click', () => {
                this.closeQuickSearch();
                Entities.viewEntity(result.type, result.entity.id);
            });
            results.appendChild(div);
        });
    },

    selectNextSearchResult(direction) {
        const results = document.getElementById('quickSearchResults');
        const items = results.querySelectorAll('.quick-search-result:not(.text-muted)');
        if (items.length === 0) return;

        let currentIndex = -1;
        items.forEach((item, i) => {
            if (item.classList.contains('selected')) {
                currentIndex = i;
                item.classList.remove('selected');
            }
        });

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        items[newIndex].classList.add('selected');
        items[newIndex].scrollIntoView({ block: 'nearest' });
    },

    setupToasts() {},

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))) {
                e.preventDefault();
                this.openQuickSearch();
            }
            if (e.key === 'Escape') {
                if (document.getElementById('quickSearchOverlay').classList.contains('active')) {
                    this.closeQuickSearch();
                } else if (document.getElementById('modalOverlay').classList.contains('active')) {
                    this.closeModal();
                }
            }
            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                DataManager.manualSaveToFile();
            }
            if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !e.ctrlKey && !e.altKey) {
                const tabs = ['dashboard', 'npcs', 'locations', 'shops', 'quests', 'items', 'lore', 'maps', 'tools'];
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9 && tabs[num - 1]) {
                    this.switchTab(tabs[num - 1]);
                }
            }
        });
    },

    setupSaveButtons() {
        // Add save button to header
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            // Folder indicator (shows when folder is set)
            const folderIndicator = document.createElement('span');
            folderIndicator.className = 'folder-indicator';
            folderIndicator.id = 'folderIndicator';
            folderIndicator.title = 'Save folder';
            headerRight.insertBefore(folderIndicator, headerRight.firstChild);

            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn btn-icon';
            saveBtn.id = 'manualSaveBtn';
            saveBtn.title = 'Save (Ctrl+S)';
            saveBtn.innerHTML = '<i class="icon icon-save"></i>';
            saveBtn.addEventListener('click', () => DataManager.manualSaveToFile());
            headerRight.insertBefore(saveBtn, folderIndicator);

            // Update folder indicator
            this.updateFolderIndicator();
        }
    },

    updateFolderIndicator() {
        const indicator = document.getElementById('folderIndicator');
        if (!indicator) return;

        const status = DataManager.getFolderStatus();
        if (status.hasFolder) {
            indicator.textContent = status.folderName;
            indicator.classList.add('active');
            indicator.title = `Saving to: ${status.folderName}/${status.fileName}`;
        } else if (status.isSupported) {
            indicator.textContent = 'No folder set';
            indicator.classList.remove('active');
            indicator.title = 'Click Settings to set a save folder';
        } else {
            indicator.textContent = '';
            indicator.title = '';
        }
    },

    updateTimeDisplay() {
        const display = document.getElementById('timeDisplay');
        if (!display) return;
        const dateEl = display.querySelector('.current-date');
        const todEl = display.querySelector('.time-of-day');

        dateEl.textContent = DataManager.getFormattedDate();
        todEl.textContent = `${DataManager.getFormattedTime()} - ${DataManager.data.time.timeOfDay}`;

        display.onclick = null;
        display.addEventListener('click', () => this.openTimeModal());
    },

    openTimeModal() {
        const time = DataManager.data.time;
        const weather = DataManager.data.weather;
        const moon = DataManager.getMoonPhase();
        const settings = DataManager.data.settings;

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="inner-tabs">
                <button class="inner-tab active" data-time-tab="time">Time & Date</button>
                <button class="inner-tab" data-time-tab="weather">Weather</button>
                <button class="inner-tab" data-time-tab="settings">Settings</button>
            </div>

            <div class="time-tab-content" id="time-tab-time">
                <div class="time-panel">
                    <div class="time-panel-date">${DataManager.getFormattedDate()}</div>
                    <div class="time-panel-year">Year ${time.currentDate.year}</div>
                    <div class="time-panel-tod">${DataManager.getFormattedTime()} - ${time.timeOfDay}</div>
                    <div class="time-panel-moon">${moon.name}</div>

                    <div class="time-controls">
                        <button class="btn btn-small" data-advance="1" data-unit="hours">+1 Hour</button>
                        <button class="btn btn-small" data-advance="4" data-unit="hours">+4 Hours</button>
                        <button class="btn btn-small" data-advance="8" data-unit="hours">+8 Hours</button>
                        <button class="btn btn-small" data-advance="1" data-unit="days">+1 Day</button>
                        <button class="btn btn-small" data-advance="7" data-unit="days">+1 Week</button>
                        <button class="btn btn-small" data-advance="1" data-unit="months">+1 Month</button>
                    </div>

                    <div style="margin-top: var(--spacing-lg);">
                        <h3 style="margin-bottom: var(--spacing-sm);">Set Date & Time</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Day</label>
                                <input type="number" id="setDay" min="1" max="30" value="${time.currentDate.day}">
                            </div>
                            <div class="form-group">
                                <label>Month</label>
                                <select id="setMonth">
                                    ${time.calendarConfig.monthNames.map((name, i) =>
            `<option value="${i + 1}" ${i + 1 === time.currentDate.month ? 'selected' : ''}>${name}</option>`
        ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Year</label>
                                <input type="number" id="setYear" value="${time.currentDate.year}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Hour (0-23)</label>
                                <input type="number" id="setHour" min="0" max="23" value="${time.hour}">
                            </div>
                            <div class="form-group">
                                <label>Time of Day</label>
                                <select id="setTimeOfDay">
                                    ${['dawn', 'morning', 'midday', 'afternoon', 'evening', 'dusk', 'night', 'midnight'].map(t =>
            `<option value="${t}" ${t === time.timeOfDay ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`
        ).join('')}
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" id="setTimeBtn">Set Time</button>
                    </div>
                </div>
            </div>

            <div class="time-tab-content hidden" id="time-tab-weather">
                <div class="weather-display">
                    <div class="weather-current">
                        <div class="weather-icon"><i class="icon icon-weather-${weather.current}"></i></div>
                        <div class="weather-temp">${weather.temperatureValue !== undefined ? weather.temperatureValue + '°C' : weather.temperature}</div>
                        <div class="weather-desc">${weather.description}</div>
                    </div>
                    <div class="weather-details">
                        <p><strong>Condition:</strong> ${weather.current.replace(/_/g, ' ')}</p>
                        <p><strong>Wind:</strong> ${weather.wind.replace(/_/g, ' ')}</p>
                        <p><strong>Precipitation:</strong> ${weather.precipitation.replace(/_/g, ' ')}</p>
                        <p><strong>Season:</strong> ${weather.season}</p>
                        <p><strong>Terrain:</strong> ${(weather.terrain || 'lowlands').replace(/_/g, ' ')}</p>
                    </div>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <div class="form-group">
                        <label>Current Terrain/Location</label>
                        <select id="setWeatherTerrain">
                            <optgroup label="Major Regions">
                                ${[
            ['tomber_ranges', 'Tomber Ranges (Mountains)'],
            ['arodens_stand', 'Aroden\'s Stand (Mountains)'],
            ['old_deadwood', 'Old Deadwood (Corrupted Forest)'],
            ['skyless_waste', 'Skyless Waste (Badlands)'],
            ['ironsand_vale', 'Ironsand Vale (Forest Valley)'],
            ['britevold_forest', 'Britevold Forest (Dense Forest)'],
            ['concordance_bay', 'Concordance Bay (Coastal)'],
            ['starfall_lake', 'Starfall Lake (Lakeside)']
        ].map(([val, label]) =>
            `<option value="${val}" ${val === (weather.terrain || 'lowlands') ? 'selected' : ''}>${label}</option>`
        ).join('')}
                            </optgroup>
                            <optgroup label="General Terrain">
                                ${[
            ['lowlands', 'Central Lowlands'],
            ['river_valley', 'River Valley']
        ].map(([val, label]) =>
            `<option value="${val}" ${val === (weather.terrain || 'lowlands') ? 'selected' : ''}>${label}</option>`
        ).join('')}
                            </optgroup>
                        </select>
                    </div>
                    <button class="btn" id="setTerrainBtn">Set Terrain & Regenerate Weather</button>
                </div>
                <div style="margin-top: var(--spacing-md);">
                    <button class="btn" id="rerollWeather">Generate New Weather</button>
                </div>
                <div style="margin-top: var(--spacing-lg);">
                    <h3 style="margin-bottom: var(--spacing-sm);">Set Weather Manually</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Condition</label>
                            <select id="setWeatherCondition">
                                ${['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'rain', 'thunderstorm', 'fog', 'drizzle', 'light_snow', 'snow', 'sleet', 'freezing_rain', 'heatwave', 'windy', 'dust_storm'].map(c =>
            `<option value="${c}" ${c === weather.current ? 'selected' : ''}>${c.replace(/_/g, ' ')}</option>`
        ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Temperature (°C)</label>
                            <input type="number" id="setWeatherTemp" value="${weather.temperatureValue || 15}" min="-30" max="45">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Wind</label>
                            <select id="setWeatherWind">
                                ${['calm', 'light_breeze', 'moderate', 'strong', 'gale'].map(w =>
            `<option value="${w}" ${w === weather.wind ? 'selected' : ''}>${w.replace(/_/g, ' ')}</option>`
        ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Precipitation</label>
                            <select id="setWeatherPrecip">
                                ${['none', 'mist', 'light_rain', 'rain', 'heavy_rain', 'light_snow', 'snow', 'sleet', 'freezing_rain'].map(p =>
            `<option value="${p}" ${p === weather.precipitation ? 'selected' : ''}>${p.replace(/_/g, ' ')}</option>`
        ).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="setWeatherBtn">Set Weather</button>
                </div>
            </div>

            <div class="time-tab-content hidden" id="time-tab-settings">
                ${DataManager.isFileSystemSupported() ? `
                <div class="settings-section">
                    <h3>Save Location</h3>
                    <div class="folder-status" id="folderStatusDisplay">
                        ${DataManager.folderHandle
            ? `<span class="folder-active">Saving to: <strong>${DataManager.folderHandle.name}</strong></span>`
            : '<span class="folder-inactive">No save folder set (using browser storage)</span>'}
                    </div>
                    <div class="form-group" style="margin-top: var(--spacing-sm);">
                        <button class="btn" id="chooseFolderBtn">Choose Save Folder</button>
                        <button class="btn" id="loadFromFolderBtn" ${!DataManager.folderHandle ? 'disabled' : ''}>Load from Folder</button>
                    </div>
                    <p class="form-hint">Choose a folder for auto-save. The app will save directly to this folder without download prompts.</p>
                </div>
                ` : ''}

                <div class="settings-section">
                    <h3>Auto-Save</h3>
                    <div class="form-group">
                        <label class="checkbox-group">
                            <input type="checkbox" id="settingAutoSave" ${settings.autoSave ? 'checked' : ''}>
                            <span>Enable auto-save</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Auto-save interval (minutes)</label>
                        <input type="number" id="settingAutoSaveInterval" value="${settings.autoSaveInterval || 5}" min="1" max="60">
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Weather</h3>
                    <div class="form-group">
                        <label class="checkbox-group">
                            <input type="checkbox" id="settingAutoWeather" ${settings.autoWeather ? 'checked' : ''}>
                            <span>Auto-generate weather when time advances</span>
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Weather change interval (hours)</label>
                        <input type="number" id="settingWeatherHours" value="${settings.weatherChangeHours || 6}" min="1" max="48">
                    </div>
                </div>

                <button class="btn btn-primary" id="saveSettingsBtn">Save Settings</button>

                <div class="settings-section" style="margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border);">
                    <h3>Calendar Configuration</h3>
                    <div class="form-group">
                        <label>Month Names (comma-separated)</label>
                        <textarea id="monthNames" rows="3">${time.calendarConfig.monthNames.join(', ')}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Days per Month</label>
                        <input type="number" id="daysPerMonth" value="${time.calendarConfig.daysPerMonth}" min="1">
                    </div>
                    <button class="btn btn-primary" id="saveCalendarBtn">Save Calendar</button>
                </div>

                <div class="settings-section" style="margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border);">
                    <h3>Data Management</h3>
                    <div class="form-group">
                        <label>Export Campaign Data</label>
                        <p class="form-hint">Download all campaign data as a JSON file.</p>
                        <button class="btn" id="exportDataBtn"><i class="icon icon-download"></i> Export to JSON</button>
                    </div>

                    <div class="form-group">
                        <label>Import Campaign Data</label>
                        <p class="form-hint">Load campaign data from a JSON file.</p>
                        <input type="file" id="importDataFile" accept=".json" style="display: none;">
                        <div class="btn-group">
                            <button class="btn" id="importDataBtn"><i class="icon icon-upload"></i> Import (Replace All)</button>
                            <button class="btn" id="mergeDataBtn"><i class="icon icon-upload"></i> Import (Merge)</button>
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: var(--spacing-lg);">
                        <label class="text-danger">Danger Zone</label>
                        <p class="form-hint">Permanently delete all campaign data. This cannot be undone!</p>
                        <button class="btn btn-danger" id="clearAllDataBtn"><i class="icon icon-delete"></i> Clear All Data</button>
                    </div>
                </div>
            </div>
        `;

        // Tab switching
        content.querySelectorAll('.inner-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                content.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                content.querySelectorAll('.time-tab-content').forEach(c => c.classList.add('hidden'));
                content.querySelector(`#time-tab-${tab.dataset.timeTab}`).classList.remove('hidden');
            });
        });

        // Time advance buttons
        content.querySelectorAll('[data-advance]').forEach(btn => {
            btn.addEventListener('click', () => {
                DataManager.advanceTime(parseInt(btn.dataset.advance), btn.dataset.unit);
                this.closeModal();
                this.openTimeModal();
                this.updateTimeDisplay();
                if (typeof App !== 'undefined') App.updateDashboardTime();
            });
        });

        // Set time
        content.querySelector('#setTimeBtn').addEventListener('click', () => {
            DataManager.setTime(
                {
                    day: parseInt(content.querySelector('#setDay').value),
                    month: parseInt(content.querySelector('#setMonth').value),
                    year: parseInt(content.querySelector('#setYear').value)
                },
                content.querySelector('#setTimeOfDay').value,
                parseInt(content.querySelector('#setHour').value)
            );
            this.closeModal();
            this.updateTimeDisplay();
            if (typeof App !== 'undefined') App.updateDashboardTime();
            this.showToast('Time updated', 'success');
        });

        // Weather
        content.querySelector('#rerollWeather').addEventListener('click', () => {
            DataManager.generateWeather();
            this.closeModal();
            this.openTimeModal();
            this.showToast('Weather generated', 'success');
        });

        content.querySelector('#setTerrainBtn').addEventListener('click', () => {
            const terrain = content.querySelector('#setWeatherTerrain').value;
            DataManager.data.weather.terrain = terrain;
            DataManager.generateWeather();
            this.closeModal();
            this.openTimeModal();
            this.showToast(`Terrain set to ${terrain.replace(/_/g, ' ')} - weather regenerated`, 'success');
        });

        content.querySelector('#setWeatherBtn').addEventListener('click', () => {
            const temp = parseInt(content.querySelector('#setWeatherTemp').value);
            let tempDesc = 'mild';
            if (temp < 0) tempDesc = 'freezing';
            else if (temp < 5) tempDesc = 'cold';
            else if (temp < 10) tempDesc = 'chilly';
            else if (temp < 15) tempDesc = 'cool';
            else if (temp < 20) tempDesc = 'mild';
            else if (temp < 25) tempDesc = 'warm';
            else if (temp < 30) tempDesc = 'hot';
            else tempDesc = 'sweltering';

            DataManager.setWeather({
                current: content.querySelector('#setWeatherCondition').value,
                temperatureValue: temp,
                temperature: tempDesc,
                wind: content.querySelector('#setWeatherWind').value,
                precipitation: content.querySelector('#setWeatherPrecip').value
            });
            this.closeModal();
            this.openTimeModal();
            this.showToast('Weather updated', 'success');
        });

        // Folder selection (File System Access API)
        const chooseFolderBtn = content.querySelector('#chooseFolderBtn');
        const loadFromFolderBtn = content.querySelector('#loadFromFolderBtn');

        if (chooseFolderBtn) {
            chooseFolderBtn.addEventListener('click', async () => {
                const handle = await DataManager.chooseSaveFolder();
                if (handle) {
                    // Update the status display
                    const statusDisplay = content.querySelector('#folderStatusDisplay');
                    if (statusDisplay) {
                        statusDisplay.innerHTML = `<span class="folder-active">Saving to: <strong>${handle.name}</strong></span>`;
                    }
                    if (loadFromFolderBtn) loadFromFolderBtn.disabled = false;
                    this.updateFolderIndicator();
                }
            });
        }

        if (loadFromFolderBtn) {
            loadFromFolderBtn.addEventListener('click', async () => {
                const success = await DataManager.loadFromFolder();
                if (success) {
                    this.closeModal();
                    // Refresh the UI
                    if (typeof App !== 'undefined' && App.refreshAll) {
                        App.refreshAll();
                    } else {
                        location.reload();
                    }
                }
            });
        }

        // Settings
        content.querySelector('#saveSettingsBtn').addEventListener('click', () => {
            DataManager.updateSettings({
                autoSave: content.querySelector('#settingAutoSave').checked,
                autoSaveInterval: parseInt(content.querySelector('#settingAutoSaveInterval').value) || 5,
                autoWeather: content.querySelector('#settingAutoWeather').checked,
                weatherChangeHours: parseInt(content.querySelector('#settingWeatherHours').value) || 6
            });
            this.showToast('Settings saved', 'success');
        });

        // Calendar
        content.querySelector('#saveCalendarBtn').addEventListener('click', () => {
            const monthNames = content.querySelector('#monthNames').value.split(',').map(n => n.trim()).filter(Boolean);
            const daysPerMonth = parseInt(content.querySelector('#daysPerMonth').value);

            if (monthNames.length > 0 && daysPerMonth > 0) {
                DataManager.data.time.calendarConfig.monthNames = monthNames;
                DataManager.data.time.calendarConfig.monthsPerYear = monthNames.length;
                DataManager.data.time.calendarConfig.daysPerMonth = daysPerMonth;
                DataManager.save();
                this.showToast('Calendar saved', 'success');
                this.updateTimeDisplay();
            }
        });

        // Data Management
        content.querySelector('#exportDataBtn').addEventListener('click', () => {
            DataManager.exportJSON();
            this.showToast('Data exported', 'success');
        });

        const importDataFile = content.querySelector('#importDataFile');
        content.querySelector('#importDataBtn').addEventListener('click', () => {
            importDataFile.dataset.mode = 'replace';
            importDataFile.click();
        });
        content.querySelector('#mergeDataBtn').addEventListener('click', () => {
            importDataFile.dataset.mode = 'merge';
            importDataFile.click();
        });

        importDataFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const result = DataManager.importJSON(ev.target.result, { merge: importDataFile.dataset.mode === 'merge' });
                    if (result.success) {
                        this.showToast('Data imported successfully', 'success');
                        this.closeModal();
                        location.reload();
                    } else {
                        this.showToast('Import failed: ' + result.error, 'error');
                    }
                };
                reader.readAsText(file);
            }
        });

        content.querySelector('#clearAllDataBtn').addEventListener('click', () => {
            this.confirm('Are you sure you want to delete ALL campaign data? This cannot be undone!', () => {
                DataManager.clearAll();
                this.showToast('All data cleared', 'warning');
                this.closeModal();
                location.reload();
            });
        });

        this.openModal({
            title: 'Time, Weather & Settings',
            content,
            size: 'large'
        });
    },

    setupCampaignName() {
        const nameEl = document.getElementById('campaignName');
        nameEl.textContent = DataManager.data.meta.campaignName;

        nameEl.addEventListener('click', () => {
            const content = document.createElement('div');
            content.innerHTML = `
                <div class="form-group">
                    <label>Campaign Name</label>
                    <input type="text" id="campaignNameInput" value="${Utils.escapeHtml(DataManager.data.meta.campaignName)}">
                </div>
            `;

            const footer = document.createElement('div');
            footer.innerHTML = `
                <button class="btn" id="cancelName">Cancel</button>
                <button class="btn btn-primary" id="saveName">Save</button>
            `;

            this.openModal({ title: 'Campaign Name', content, footer });

            footer.querySelector('#cancelName').addEventListener('click', () => this.closeModal());
            footer.querySelector('#saveName').addEventListener('click', () => {
                const newName = content.querySelector('#campaignNameInput').value.trim();
                if (newName) {
                    DataManager.setCampaignName(newName);
                    nameEl.textContent = newName;
                    this.showToast('Campaign name updated', 'success');
                }
                this.closeModal();
            });
        });
    },

    openSettings() {
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label>Export Campaign Data</label>
                <p class="form-hint">Download all campaign data as a JSON file.</p>
                <button class="btn" id="exportBtn">Export to JSON</button>
            </div>

            <div class="form-group">
                <label>Import Campaign Data</label>
                <p class="form-hint">Load campaign data from a JSON file.</p>
                <input type="file" id="importFile" accept=".json" style="display: none;">
                <button class="btn" id="importBtn">Import (Replace All)</button>
                <button class="btn" id="mergeBtn">Import (Merge)</button>
            </div>

            <div class="form-group">
                <label class="text-danger">Clear All Data</label>
                <p class="form-hint">Permanently delete all campaign data. This cannot be undone!</p>
                <button class="btn btn-danger" id="clearBtn">Clear All Data</button>
            </div>
        `;

        content.querySelector('#exportBtn').addEventListener('click', () => {
            DataManager.exportJSON();
            this.showToast('Data exported', 'success');
        });

        const importFile = content.querySelector('#importFile');
        content.querySelector('#importBtn').addEventListener('click', () => {
            importFile.dataset.mode = 'replace';
            importFile.click();
        });
        content.querySelector('#mergeBtn').addEventListener('click', () => {
            importFile.dataset.mode = 'merge';
            importFile.click();
        });

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const result = DataManager.importJSON(ev.target.result, { merge: importFile.dataset.mode === 'merge' });
                    if (result.success) {
                        this.showToast('Data imported successfully', 'success');
                        this.closeModal();
                        location.reload();
                    } else {
                        this.showToast('Import failed: ' + result.error, 'error');
                    }
                };
                reader.readAsText(file);
            }
        });

        content.querySelector('#clearBtn').addEventListener('click', () => {
            this.confirm('Are you sure you want to delete ALL campaign data? This cannot be undone!', () => {
                DataManager.clearAll();
                this.showToast('All data cleared', 'warning');
                this.closeModal();
                location.reload();
            });
        });

        this.openModal({
            title: 'Data Management',
            content,
            size: 'large'
        });
    },

    createLinkSelector(type, selectedIds = [], options = {}) {
        const { multiple = true, excludeId = null } = options;
        const container = document.createElement('div');
        container.className = 'link-selector';

        const entities = DataManager.getAllEntities(type).filter(e => e.id !== excludeId);
        const selectedSet = new Set(selectedIds);

        container.innerHTML = `
            <div class="link-selector-search">
                <input type="text" placeholder="Search ${Utils.getEntityTypeName(type)}...">
            </div>
            <div class="link-selector-list">
                ${entities.map(e => `
                    <label class="link-selector-item ${selectedSet.has(e.id) ? 'selected' : ''}">
                        <input type="${multiple ? 'checkbox' : 'radio'}"
                               name="link-${type}"
                               value="${e.id}"
                               ${selectedSet.has(e.id) ? 'checked' : ''}>
                        <span>${Utils.escapeHtml(e.name || e.title)}</span>
                    </label>
                `).join('')}
                ${entities.length === 0 ? `<div class="text-muted" style="padding: var(--spacing-sm);">No ${Utils.getEntityTypeName(type)} found</div>` : ''}
            </div>
        `;

        const searchInput = container.querySelector('input[type="text"]');
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            container.querySelectorAll('.link-selector-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? '' : 'none';
            });
        });

        container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                input.closest('.link-selector-item').classList.toggle('selected', input.checked);
            });
        });

        container.getSelectedIds = () => {
            return Array.from(container.querySelectorAll('input:checked')).map(i => i.value);
        };

        return container;
    },

    createSelectedLinksDisplay(type, ids, onRemove) {
        const container = document.createElement('div');
        container.className = 'selected-links';

        ids.forEach(id => {
            const entity = DataManager.getEntity(type, id);
            if (entity) {
                const link = document.createElement('span');
                link.className = 'selected-link';
                link.innerHTML = `
                    <i class="icon icon-${type}"></i> ${Utils.escapeHtml(entity.name || entity.title)}
                    <span class="selected-link-remove" data-id="${id}">&times;</span>
                `;
                link.querySelector('.selected-link-remove').addEventListener('click', () => {
                    if (onRemove) onRemove(id);
                    link.remove();
                });
                container.appendChild(link);
            }
        });

        return container;
    },

    renderEntityLinks(linkedEntities) {
        const sections = [];
        Object.keys(linkedEntities).forEach(type => {
            const entities = linkedEntities[type];
            if (entities && entities.length > 0) {
                sections.push(`
                    <div class="entity-detail-section">
                        <h3><i class="icon icon-${type}"></i> ${Utils.getEntityTypeName(type)}</h3>
                        <div class="entity-links-list">
                            ${entities.map(e => `
                                <span class="entity-link" data-type="${type}" data-id="${e.id}">
                                    ${Utils.escapeHtml(e.name || e.title)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `);
            }
        });
        return sections.join('');
    }
};