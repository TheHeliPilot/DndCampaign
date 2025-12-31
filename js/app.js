// DM Screen - Main Application

const App = {
    async init() {
        console.log('DM Screen initializing...');

        // Wait for DataManager to fully initialize (including folder handle restoration)
        await DataManager.init();

        // Initialize modules
        UI.init();
        UI.setupCampaignName();
        Entities.init();
        Maps.init();
        Tools.init();

        // Initialize dashboard
        this.initDashboard();

        // Setup party editor
        document.getElementById('editPartyBtn')?.addEventListener('click', () => this.openPartyEditor());

        // Setup session notes auto-save
        const sessionNotes = document.getElementById('sessionNotes');
        if (sessionNotes) {
            sessionNotes.value = DataManager.data.sessionNotes || '';
            sessionNotes.addEventListener('input', Utils.debounce(() => {
                DataManager.setSessionNotes(sessionNotes.value);
            }, 500));
        }

        // Render initial lists
        this.renderAllLists();

        // Update folder indicator after init
        UI.updateFolderIndicator();

        console.log('DM Screen initialized');
    },

    // Refresh all UI after data reload
    refreshAll() {
        this.initDashboard();
        this.renderAllLists();
        Maps.renderMapList();
        Tools.renderInitiativeList();
        Tools.updateDiceHistory();
        UI.updateTimeDisplay();
        UI.updateFolderIndicator();

        const sessionNotes = document.getElementById('sessionNotes');
        if (sessionNotes) {
            sessionNotes.value = DataManager.data.sessionNotes || '';
        }

        document.getElementById('campaignName').textContent = DataManager.data.meta.campaignName;
    },

    initDashboard() {
        this.updateDashboardTime();
        this.updateDashboardWeather();
        this.updateDashboardQuests();
        this.updateDashboardParty();
        this.updateDashboardRecent();
    },

    renderAllLists() {
        Entities.renderEntityList('npcs');
        Entities.renderEntityList('locations');
        Entities.renderEntityList('shops');
        Entities.renderEntityList('quests');
        Entities.renderEntityList('items');
        Entities.renderEntityList('lore');
    },

    updateDashboardTime() {
        const container = document.getElementById('dashboardTime');
        if (!container) return;

        const time = DataManager.data.time;
        const moon = DataManager.getMoonPhase();

        container.innerHTML = `
            <div class="time-panel">
                <div class="time-panel-date">${DataManager.getFormattedDate()}</div>
                <div class="time-panel-year">Year ${time.currentDate.year}</div>
                <div class="time-panel-tod">${DataManager.getFormattedTime()} - ${time.timeOfDay}</div>
                <div class="time-panel-moon"><i class="icon icon-moon-${moon.phase}"></i> ${moon.name}</div>

                <div class="time-controls">
                    <button class="btn btn-small" data-advance="1" data-unit="hours">+1 Hour</button>
                    <button class="btn btn-small" data-advance="4" data-unit="hours">+4 Hours</button>
                    <button class="btn btn-small" data-advance="1" data-unit="days">+1 Day</button>
                    <button class="btn btn-small" data-advance="7" data-unit="days">+1 Week</button>
                </div>
            </div>
        `;

        container.querySelectorAll('[data-advance]').forEach(btn => {
            btn.addEventListener('click', () => {
                DataManager.advanceTime(parseInt(btn.dataset.advance), btn.dataset.unit);
                this.updateDashboardTime();
                this.updateDashboardWeather();
                UI.updateTimeDisplay();
                UI.showToast('Time advanced', 'success');
            });
        });
    },

    updateDashboardWeather() {
        const container = document.getElementById('dashboardWeather');
        if (!container) return;

        const weather = DataManager.data.weather;
        const currentTerrain = weather.terrain || 'lowlands';
        const terrainDisplay = currentTerrain.replace(/_/g, ' ');

        const terrainOptions = [
            ['tomber_ranges', 'Tomber Ranges'],
            ['arodens_stand', 'Aroden\'s Stand'],
            ['old_deadwood', 'Old Deadwood'],
            ['skyless_waste', 'Skyless Waste'],
            ['ironsand_vale', 'Ironsand Vale'],
            ['britevold_forest', 'Britevold Forest'],
            ['concordance_bay', 'Concordance Bay'],
            ['starfall_lake', 'Starfall Lake'],
            ['lowlands', 'Lowlands'],
            ['river_valley', 'River Valley']
        ];

        container.innerHTML = `
            <div class="weather-panel">
                <div class="weather-panel-main">
                    <div class="weather-panel-icon"><i class="icon icon-weather-${weather.current}"></i></div>
                    <div class="weather-panel-info">
                        <div class="weather-panel-condition">${weather.current.replace(/_/g, ' ')}</div>
                        <div class="weather-panel-temp">${weather.temperatureValue !== undefined ? weather.temperatureValue + '°C' : weather.temperature}</div>
                    </div>
                </div>
                <div class="weather-panel-details">
                    <div class="weather-detail"><span class="weather-detail-label">Wind:</span> ${weather.wind.replace(/_/g, ' ')}</div>
                    <div class="weather-detail"><span class="weather-detail-label">Precip:</span> ${weather.precipitation.replace(/_/g, ' ')}</div>
                    <div class="weather-detail"><span class="weather-detail-label">Season:</span> ${weather.season}</div>
                </div>
                <div class="weather-panel-terrain">
                    <label class="weather-detail-label">Location:</label>
                    <select id="dashboardTerrainSelect" class="weather-terrain-select">
                        ${terrainOptions.map(([val, label]) =>
            `<option value="${val}" ${val === currentTerrain ? 'selected' : ''}>${label}</option>`
        ).join('')}
                    </select>
                </div>
                <div class="weather-panel-desc">${weather.description}</div>
                <div class="weather-controls">
                    <button class="btn btn-small" id="rerollWeatherDash"><i class="icon icon-dice"></i> New Weather</button>
                </div>
            </div>
        `;

        container.querySelector('#dashboardTerrainSelect')?.addEventListener('change', (e) => {
            DataManager.data.weather.terrain = e.target.value;
            DataManager.generateWeather();
            this.updateDashboardWeather();
            UI.showToast(`Location: ${e.target.value.replace(/_/g, ' ')}`, 'success');
        });

        container.querySelector('#rerollWeatherDash')?.addEventListener('click', () => {
            DataManager.generateWeather();
            this.updateDashboardWeather();
            UI.showToast('Weather generated', 'success');
        });
    },

    updateDashboardQuests() {
        const container = document.getElementById('dashboardQuests');
        if (!container) return;

        const activeQuests = DataManager.searchEntities('quests', '', { status: 'Active' });
        const availableQuests = DataManager.searchEntities('quests', '', { status: 'Available' });

        const quests = [...activeQuests, ...availableQuests];

        if (quests.length === 0) {
            container.innerHTML = '<div class="text-muted">No active quests</div>';
            return;
        }

        container.innerHTML = `
            <div class="quest-mini-list">
                ${quests.slice(0, 10).map(q => `
                    <div class="quest-mini-item" data-id="${q.id}">
                        <span class="quest-mini-type">${q.type || 'Quest'}</span>
                        <span class="quest-mini-name">${Utils.escapeHtml(q.name)}</span>
                        <span class="tag ${Utils.getStatusClass(q.status)}" style="font-size:0.7rem;">${q.status}</span>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.quest-mini-item').forEach(item => {
            item.addEventListener('click', () => {
                Entities.viewEntity('quests', item.dataset.id);
            });
        });
    },

    updateDashboardParty() {
        const container = document.getElementById('dashboardParty');
        if (!container) return;

        const party = DataManager.data.party || [];

        if (party.length === 0) {
            container.innerHTML = '<div class="text-muted">No party members added</div>';
            return;
        }

        container.innerHTML = `
            <div class="party-list">
                ${party.map(member => `
                    <div class="party-member">
                        <span class="party-member-name">${Utils.escapeHtml(member.name)}</span>
                        <div class="party-member-stats">
                            ${member.ac ? `<span class="party-member-stat"><span class="party-member-stat-label">AC</span> ${member.ac}</span>` : ''}
                            ${member.passivePerception ? `<span class="party-member-stat"><span class="party-member-stat-label">PP</span> ${member.passivePerception}</span>` : ''}
                            ${member.hp ? `<span class="party-member-stat"><span class="party-member-stat-label">HP</span> ${member.hp}</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateDashboardRecent() {
        const container = document.getElementById('dashboardRecent');
        if (!container) return;

        // Collect recent entities from all types
        const allEntities = [];
        const types = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore'];

        types.forEach(type => {
            const entities = DataManager.getAllEntities(type);
            entities.forEach(e => {
                allEntities.push({
                    type,
                    entity: e,
                    date: new Date(e.updatedAt || e.createdAt)
                });
            });
        });

        // Sort by date, most recent first
        allEntities.sort((a, b) => b.date - a.date);

        if (allEntities.length === 0) {
            container.innerHTML = '<div class="text-muted">No recent activity</div>';
            return;
        }

        container.innerHTML = `
            <div class="activity-list">
                ${allEntities.slice(0, 10).map(item => `
                    <div class="activity-item">
                        <span class="activity-type-icon">${Utils.getEntityIcon(item.type)}</span>
                        <span class="activity-name" data-type="${item.type}" data-id="${item.entity.id}">
                            ${Utils.escapeHtml(item.entity.name || item.entity.title)}
                        </span>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.activity-name').forEach(link => {
            link.addEventListener('click', () => {
                Entities.viewEntity(link.dataset.type, link.dataset.id);
            });
        });
    },

    openPartyEditor() {
        const party = DataManager.data.party || [];

        const content = document.createElement('div');
        content.innerHTML = `
            <div id="partyList"></div>
            <button class="btn" id="addPartyMember" style="margin-top:var(--spacing-md);"><i class="icon icon-add"></i> Add Party Member</button>
        `;

        const renderMembers = () => {
            const listEl = content.querySelector('#partyList');
            listEl.innerHTML = party.map((member, i) => `
                <div class="party-member-edit" style="background:var(--bg-dark);padding:var(--spacing-md);border-radius:var(--radius-sm);margin-bottom:var(--spacing-sm);">
                    <div class="form-row">
                        <div class="form-group" style="flex:2;">
                            <label>Name</label>
                            <input type="text" class="member-name" data-index="${i}" value="${Utils.escapeHtml(member.name || '')}">
                        </div>
                        <div class="form-group">
                            <label>AC</label>
                            <input type="number" class="member-ac" data-index="${i}" value="${member.ac || ''}">
                        </div>
                        <div class="form-group">
                            <label>Passive Perception</label>
                            <input type="number" class="member-pp" data-index="${i}" value="${member.passivePerception || ''}">
                        </div>
                        <div class="form-group">
                            <label>HP</label>
                            <input type="number" class="member-hp" data-index="${i}" value="${member.hp || ''}">
                        </div>
                        <button class="btn btn-danger btn-small remove-member" data-index="${i}" style="align-self:flex-end;"><i class="icon icon-delete"></i></button>
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <input type="text" class="member-notes" data-index="${i}" value="${Utils.escapeHtml(member.notes || '')}">
                    </div>
                </div>
            `).join('');

            // Remove handlers
            listEl.querySelectorAll('.remove-member').forEach(btn => {
                btn.addEventListener('click', () => {
                    party.splice(parseInt(btn.dataset.index), 1);
                    renderMembers();
                });
            });

            // Update handlers
            const updateMember = (input, field) => {
                const idx = parseInt(input.dataset.index);
                let value = input.value;
                if (field !== 'name' && field !== 'notes') {
                    value = parseInt(value) || null;
                }
                party[idx][field] = value;
            };

            listEl.querySelectorAll('.member-name').forEach(input =>
                input.addEventListener('change', () => updateMember(input, 'name')));
            listEl.querySelectorAll('.member-ac').forEach(input =>
                input.addEventListener('change', () => updateMember(input, 'ac')));
            listEl.querySelectorAll('.member-pp').forEach(input =>
                input.addEventListener('change', () => updateMember(input, 'passivePerception')));
            listEl.querySelectorAll('.member-hp').forEach(input =>
                input.addEventListener('change', () => updateMember(input, 'hp')));
            listEl.querySelectorAll('.member-notes').forEach(input =>
                input.addEventListener('change', () => updateMember(input, 'notes')));
        };

        renderMembers();

        content.querySelector('#addPartyMember').addEventListener('click', () => {
            party.push({ name: '', ac: null, passivePerception: null, hp: null, notes: '' });
            renderMembers();
        });

        const footer = document.createElement('div');
        footer.innerHTML = `
            <button class="btn" id="cancelParty">Cancel</button>
            <button class="btn btn-primary" id="saveParty">Save</button>
        `;

        UI.openModal({
            title: 'Edit Party',
            content,
            footer,
            size: 'large'
        });

        footer.querySelector('#cancelParty').addEventListener('click', () => UI.closeModal());
        footer.querySelector('#saveParty').addEventListener('click', () => {
            DataManager.updateParty(party.filter(m => m.name));
            this.updateDashboardParty();
            UI.showToast('Party updated', 'success');
            UI.closeModal();
        });
    }
};

// Tab initialization functions
window.initDashboardTab = () => {
    App.initDashboard();
};

window.initNpcsTab = () => {
    Entities.renderEntityList('npcs');
};

window.initLocationsTab = () => {
    Entities.renderEntityList('locations');
};

window.initShopsTab = () => {
    Entities.renderEntityList('shops');
};

window.initQuestsTab = () => {
    Entities.renderEntityList('quests');
};

window.initItemsTab = () => {
    Entities.renderEntityList('items');
};

window.initLoreTab = () => {
    Entities.renderEntityList('lore');
};

window.initMapsTab = () => {
    Maps.renderMapList();
};

window.initToolsTab = () => {
    Tools.renderInitiativeList();
    Tools.updateDiceHistory();
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Backup reminder (every 30 minutes of active use)
let lastBackupReminder = Date.now();
setInterval(() => {
    const now = Date.now();
    if (now - lastBackupReminder > 30 * 60 * 1000) {
        UI.showToast('Remember to export your data periodically!', 'warning', 5000);
        lastBackupReminder = now;
    }
}, 60000);