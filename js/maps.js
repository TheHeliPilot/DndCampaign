// DM Screen - Maps Module
// Optimized for 4K displays with GPU-accelerated transforms and throttled events

const Maps = {
    currentMapId: null,
    currentTool: 'pan',
    transform: { x: 0, y: 0, scale: 1 },
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    // Use CSS icon classes instead of emojis for better rendering
    pinTypes: {
        npc: { iconClass: 'icon-pin-npc', color: '#4a90d9' },
        location: { iconClass: 'icon-pin-location', color: '#d94a4a' },
        quest: { iconClass: 'icon-pin-quest', color: '#d9b44a' },
        shop: { iconClass: 'icon-pin-shop', color: '#4ad94a' },
        danger: { iconClass: 'icon-pin-danger', color: '#d94a4a' },
        secret: { iconClass: 'icon-pin-secret', color: '#9b59b6' },
        treasure: { iconClass: 'icon-pin-treasure', color: '#f1c40f' },
        custom: { iconClass: 'icon-pin-custom', color: '#8b7355' }
    },
    // Throttle tracking for performance
    _lastMoveTime: 0,
    _moveThrottleMs: 16, // ~60fps
    _rafId: null,
    _pendingTransform: null,

    init() {
        this.setupMapToolbar();
        this.setupMapCanvas();
        this.renderMapList();
    },

    // Throttle helper for high-frequency events
    throttle(fn, delay) {
        let lastCall = 0;
        return function(...args) {
            const now = performance.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return fn.apply(this, args);
            }
        };
    },

    setupMapToolbar() {
        document.getElementById('addMapBtn')?.addEventListener('click', () => this.openMapForm());

        document.getElementById('mapZoomIn')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('mapZoomOut')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('mapReset')?.addEventListener('click', () => this.resetView());

        document.querySelectorAll('.map-tool').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.map-tool').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTool = btn.dataset.tool;
            });
        });
    },

    setupMapCanvas() {
        const canvas = document.getElementById('mapCanvas');
        if (!canvas) return;

        // Mouse events for panning - use passive where possible
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        canvas.addEventListener('mouseup', () => this.handleMouseUp());
        canvas.addEventListener('mouseleave', () => this.handleMouseUp());

        // Wheel for zoom - throttled
        const throttledWheel = this.throttle((e) => {
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(factor, e.clientX, e.clientY);
        }, 16);

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            throttledWheel(e);
        }, { passive: false });

        // Click for pins
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    },

    handleMouseDown(e) {
        if (this.currentTool !== 'pan') return;
        if (e.target.closest('.map-pin')) return;

        this.isDragging = true;
        this.dragStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };

        const container = document.querySelector('.map-image-container');
        if (container) {
            container.classList.add('grabbing');
            // will-change is handled by .grabbing class in CSS
        }
    },

    handleMouseMove(e) {
        if (!this.isDragging) return;

        // Throttle with requestAnimationFrame for smooth 4K performance
        const now = performance.now();
        if (now - this._lastMoveTime < this._moveThrottleMs) return;
        this._lastMoveTime = now;

        this.transform.x = e.clientX - this.dragStart.x;
        this.transform.y = e.clientY - this.dragStart.y;

        // Use RAF for smooth rendering
        if (!this._rafId) {
            this._rafId = requestAnimationFrame(() => {
                this.applyTransform();
                this._rafId = null;
            });
        }
    },

    handleMouseUp() {
        this.isDragging = false;
        const container = document.querySelector('.map-image-container');
        if (container) {
            container.classList.remove('grabbing');
            // will-change reset is handled by CSS when .grabbing is removed
        }
        // Cancel any pending RAF
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    },

    handleCanvasClick(e) {
        if (this.currentTool !== 'pin') return;
        if (!this.currentMapId) return;
        if (e.target.closest('.map-pin')) return;

        const canvas = document.getElementById('mapCanvas');
        const container = document.querySelector('.map-image-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.transform.scale;
        const y = (e.clientY - rect.top) / this.transform.scale;

        this.openPinForm(x, y);
    },

    zoom(factor, clientX, clientY) {
        const canvas = document.getElementById('mapCanvas');
        if (!canvas) return;

        const oldScale = this.transform.scale;
        this.transform.scale = Math.max(0.1, Math.min(5, this.transform.scale * factor));

        // Zoom towards mouse position
        if (clientX !== undefined && clientY !== undefined) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            this.transform.x = mouseX - (mouseX - this.transform.x) * (this.transform.scale / oldScale);
            this.transform.y = mouseY - (mouseY - this.transform.y) * (this.transform.scale / oldScale);
        }

        this.applyTransform();
    },

    resetView() {
        this.transform = { x: 0, y: 0, scale: 1 };
        this.applyTransform();
    },

    applyTransform() {
        const container = document.querySelector('.map-image-container');
        if (container) {
            // Use translate3d for GPU acceleration on 4K displays
            container.style.transform = `translate3d(${this.transform.x}px, ${this.transform.y}px, 0) scale(${this.transform.scale})`;
        }
    },

    renderMapList() {
        const list = document.getElementById('mapsList');
        if (!list) return;

        const maps = DataManager.getAllEntities('maps');

        if (maps.length === 0) {
            list.innerHTML = '<div class="empty-state" style="padding:var(--spacing-md);"><div class="text-muted">No maps yet</div></div>';
            return;
        }

        list.innerHTML = maps.map(map => `
            <div class="map-list-item ${map.id === this.currentMapId ? 'active' : ''}" data-id="${map.id}">
                <div class="map-list-item-name">${Utils.escapeHtml(map.name)}</div>
                <div class="map-list-item-type">${Utils.escapeHtml(map.type || 'Map')}</div>
            </div>
        `).join('');

        list.querySelectorAll('.map-list-item').forEach(item => {
            item.addEventListener('click', () => this.loadMap(item.dataset.id));
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showMapContextMenu(e, item.dataset.id);
            });
        });
    },

    loadMap(mapId) {
        const map = DataManager.getEntity('maps', mapId);
        if (!map) return;

        this.currentMapId = mapId;
        this.resetView();

        const canvas = document.getElementById('mapCanvas');
        if (!canvas) return;

        canvas.innerHTML = '';

        // Get image source - prefer imageData (base64), fallback to URL
        const imageSrc = map.imageData || map.imageUrl;

        if (imageSrc) {
            const container = document.createElement('div');
            container.className = 'map-image-container';

            const img = document.createElement('img');
            img.className = 'map-image';
            img.src = imageSrc;
            img.onload = () => {
                // Center the map initially
                const canvasRect = canvas.getBoundingClientRect();
                this.transform.x = (canvasRect.width - img.width) / 2;
                this.transform.y = (canvasRect.height - img.height) / 2;
                this.applyTransform();
            };
            img.onerror = () => {
                canvas.innerHTML = `<div class="map-placeholder"><i class="icon icon-warning"></i> Failed to load map image</div>`;
            };

            container.appendChild(img);

            // Render pins
            (map.pins || []).forEach(pin => {
                const pinEl = this.createPinElement(pin);
                container.appendChild(pinEl);
            });

            canvas.appendChild(container);
        } else {
            canvas.innerHTML = '<div class="map-placeholder">No image uploaded for this map</div>';
        }

        this.renderMapList();
    },

    createPinElement(pin) {
        const pinType = this.pinTypes[pin.type] || this.pinTypes.custom;
        const el = document.createElement('div');
        el.className = 'map-pin';
        el.dataset.pinId = pin.id;
        // Use translate3d for GPU-accelerated positioning
        el.style.left = '0';
        el.style.top = '0';
        el.style.transform = `translate3d(${pin.x}px, ${pin.y}px, 0)`;
        // Use CSS icon class instead of emoji
        el.innerHTML = `
            <span class="icon ${pinType.iconClass}"></span>
            <div class="map-pin-tooltip">${Utils.escapeHtml(pin.label || 'Pin')}</div>
        `;

        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPinDetail(pin);
        });

        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showPinContextMenu(e, pin);
        });

        return el;
    },

    openMapForm(mapId = null) {
        const map = mapId ? DataManager.getEntity('maps', mapId) : {};
        const isEdit = !!mapId;

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label>Map Name *</label>
                <input type="text" id="mapName" value="${Utils.escapeHtml(map.name || '')}" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="mapType">
                    <option value="">Select...</option>
                    ${['World Map', 'Regional Map', 'City Map', 'Town Map', 'Dungeon Map', 'Building Map', 'Battle Map', 'Other'].map(t =>
            `<option value="${t}" ${map.type === t ? 'selected' : ''}>${t}</option>`
        ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Linked Location</label>
                <div id="mapLocationLink"></div>
            </div>
            <div class="form-group">
                <label>Map Image</label>
                <p class="form-hint">Upload an image or provide a URL. Drag and drop also supported.</p>
                <input type="file" id="mapImageFile" accept="image/*" style="margin-bottom:var(--spacing-sm);">
                <input type="url" id="mapImageUrl" placeholder="Or paste image URL..." value="${Utils.escapeHtml(map.imageUrl || '')}">
                ${map.imageData ? '<p class="form-hint text-success">Image already uploaded</p>' : ''}
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="mapNotes" rows="3">${Utils.escapeHtml(map.notes || '')}</textarea>
            </div>
        `;

        // Location link selector
        const locationSelector = UI.createLinkSelector('locations', map.locationId ? [map.locationId] : [], { multiple: false });
        content.querySelector('#mapLocationLink').appendChild(locationSelector);

        const footer = document.createElement('div');
        footer.innerHTML = `
            <button class="btn" id="cancelMap">Cancel</button>
            <button class="btn btn-primary" id="saveMap">${isEdit ? 'Save Changes' : 'Create Map'}</button>
        `;

        UI.openModal({
            title: isEdit ? 'Edit Map' : 'New Map',
            content,
            footer
        });

        footer.querySelector('#cancelMap').addEventListener('click', () => UI.closeModal());
        footer.querySelector('#saveMap').addEventListener('click', async () => {
            const name = content.querySelector('#mapName').value.trim();
            if (!name) {
                UI.showToast('Please enter a map name', 'error');
                return;
            }

            const data = {
                name,
                type: content.querySelector('#mapType').value,
                locationId: locationSelector.getSelectedIds()[0] || null,
                notes: content.querySelector('#mapNotes').value.trim()
            };

            // Handle image
            const fileInput = content.querySelector('#mapImageFile');
            const urlInput = content.querySelector('#mapImageUrl');

            if (fileInput.files.length > 0) {
                try {
                    data.imageData = await Utils.fileToBase64(fileInput.files[0]);
                    data.imageUrl = null;
                } catch (e) {
                    UI.showToast('Failed to process image', 'error');
                    return;
                }
            } else if (urlInput.value.trim()) {
                data.imageUrl = urlInput.value.trim();
                // Don't overwrite existing imageData if URL is just informational
            } else if (isEdit && map.imageData) {
                // Keep existing image
                data.imageData = map.imageData;
            }

            if (isEdit) {
                DataManager.updateEntity('maps', mapId, data);
                UI.showToast('Map updated', 'success');
                this.loadMap(mapId);
            } else {
                const newMap = DataManager.createEntity('maps', { ...data, pins: [] });
                UI.showToast('Map created', 'success');
                this.loadMap(newMap.id);
            }

            UI.closeModal();
            this.renderMapList();
        });
    },

    openPinForm(x, y, existingPin = null) {
        const isEdit = !!existingPin;
        const pin = existingPin || { x, y };

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label>Label *</label>
                <input type="text" id="pinLabel" value="${Utils.escapeHtml(pin.label || '')}" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="pinType">
                    ${Object.entries(this.pinTypes).map(([key, val]) =>
            `<option value="${key}" ${pin.type === key ? 'selected' : ''}>${key.charAt(0).toUpperCase() + key.slice(1)}</option>`
        ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Link to Entity (Optional)</label>
                <select id="pinLinkType">
                    <option value="">None</option>
                    <option value="npcs" ${pin.linkType === 'npcs' ? 'selected' : ''}>NPC</option>
                    <option value="locations" ${pin.linkType === 'locations' ? 'selected' : ''}>Location</option>
                    <option value="quests" ${pin.linkType === 'quests' ? 'selected' : ''}>Quest</option>
                    <option value="shops" ${pin.linkType === 'shops' ? 'selected' : ''}>Shop</option>
                </select>
                <div id="pinLinkSelector" style="margin-top:var(--spacing-sm);"></div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="pinNotes" rows="3">${Utils.escapeHtml(pin.notes || '')}</textarea>
            </div>
        `;

        // Dynamic link selector
        const linkTypeSelect = content.querySelector('#pinLinkType');
        const linkSelectorContainer = content.querySelector('#pinLinkSelector');

        const updateLinkSelector = () => {
            linkSelectorContainer.innerHTML = '';
            const type = linkTypeSelect.value;
            if (type) {
                const selector = UI.createLinkSelector(type, pin.linkId ? [pin.linkId] : [], { multiple: false });
                linkSelectorContainer.appendChild(selector);
                linkSelectorContainer._selector = selector;
            }
        };

        linkTypeSelect.addEventListener('change', updateLinkSelector);
        if (pin.linkType) updateLinkSelector();

        const footer = document.createElement('div');
        footer.innerHTML = `
            ${isEdit ? '<button class="btn btn-danger" id="deletePin">Delete</button>' : ''}
            <button class="btn" id="cancelPin">Cancel</button>
            <button class="btn btn-primary" id="savePin">${isEdit ? 'Save' : 'Add Pin'}</button>
        `;

        UI.openModal({
            title: isEdit ? 'Edit Pin' : 'Add Pin',
            content,
            footer
        });

        footer.querySelector('#cancelPin').addEventListener('click', () => UI.closeModal());

        if (isEdit) {
            footer.querySelector('#deletePin').addEventListener('click', () => {
                UI.confirm('Delete this pin?', () => {
                    this.deletePin(pin.id);
                    UI.closeModal();
                });
            });
        }

        footer.querySelector('#savePin').addEventListener('click', () => {
            const label = content.querySelector('#pinLabel').value.trim();
            if (!label) {
                UI.showToast('Please enter a label', 'error');
                return;
            }

            const pinData = {
                id: pin.id || DataManager.generateId(),
                x: pin.x,
                y: pin.y,
                label,
                type: content.querySelector('#pinType').value,
                notes: content.querySelector('#pinNotes').value.trim(),
                linkType: linkTypeSelect.value || null,
                linkId: linkSelectorContainer._selector?.getSelectedIds()[0] || null
            };

            const map = DataManager.getEntity('maps', this.currentMapId);
            if (!map) return;

            if (!map.pins) map.pins = [];

            if (isEdit) {
                const idx = map.pins.findIndex(p => p.id === pin.id);
                if (idx !== -1) map.pins[idx] = pinData;
            } else {
                map.pins.push(pinData);
            }

            DataManager.updateEntity('maps', this.currentMapId, { pins: map.pins });
            UI.showToast(isEdit ? 'Pin updated' : 'Pin added', 'success');
            UI.closeModal();
            this.loadMap(this.currentMapId);
        });
    },

    openPinDetail(pin) {
        let linkedEntity = null;
        if (pin.linkType && pin.linkId) {
            linkedEntity = DataManager.getEntity(pin.linkType, pin.linkId);
        }

        const pinType = this.pinTypes[pin.type] || this.pinTypes.custom;
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2><span class="icon ${pinType.iconClass}"></span> ${Utils.escapeHtml(pin.label)}</h2>
                    <div class="entity-detail-subtitle">${pin.type?.charAt(0).toUpperCase() + pin.type?.slice(1) || 'Pin'}</div>
                </div>

                ${linkedEntity ? `
                    <div class="entity-detail-section">
                        <h3>Linked Entity</h3>
                        <span class="entity-link" data-type="${pin.linkType}" data-id="${pin.linkId}">
                            ${Utils.getEntityIcon(pin.linkType)} ${Utils.escapeHtml(linkedEntity.name || linkedEntity.title)}
                        </span>
                    </div>
                ` : ''}

                ${pin.notes ? `
                    <div class="entity-detail-section">
                        <h3>Notes</h3>
                        <p style="white-space:pre-wrap;">${Utils.escapeHtml(pin.notes)}</p>
                    </div>
                ` : ''}
            </div>
        `;

        // Link click handler
        content.querySelectorAll('.entity-link').forEach(link => {
            link.addEventListener('click', () => {
                UI.closeModal();
                Entities.viewEntity(link.dataset.type, link.dataset.id);
            });
        });

        const footer = document.createElement('div');
        footer.innerHTML = `
            <button class="btn btn-danger" id="deletePinBtn">Delete</button>
            <button class="btn" id="closePinBtn">Close</button>
            <button class="btn btn-primary" id="editPinBtn">Edit</button>
        `;

        UI.openModal({
            title: 'Pin Details',
            content,
            footer
        });

        footer.querySelector('#closePinBtn').addEventListener('click', () => UI.closeModal());
        footer.querySelector('#editPinBtn').addEventListener('click', () => {
            UI.closeModal();
            this.openPinForm(pin.x, pin.y, pin);
        });
        footer.querySelector('#deletePinBtn').addEventListener('click', () => {
            UI.confirm('Delete this pin?', () => {
                this.deletePin(pin.id);
                UI.closeModal();
            });
        });
    },

    deletePin(pinId) {
        const map = DataManager.getEntity('maps', this.currentMapId);
        if (!map || !map.pins) return;

        map.pins = map.pins.filter(p => p.id !== pinId);
        DataManager.updateEntity('maps', this.currentMapId, { pins: map.pins });
        UI.showToast('Pin deleted', 'warning');
        this.loadMap(this.currentMapId);
    },

    showMapContextMenu(e, mapId) {
        // Simple context menu using confirm/modal
        const map = DataManager.getEntity('maps', mapId);
        if (!map) return;

        const content = document.createElement('div');
        content.innerHTML = `
            <div style="display:flex;flex-direction:column;gap:var(--spacing-sm);">
                <button class="btn" id="editMapBtn">Edit Map</button>
                <button class="btn btn-danger" id="deleteMapBtn">Delete Map</button>
            </div>
        `;

        UI.openModal({
            title: map.name,
            content
        });

        content.querySelector('#editMapBtn').addEventListener('click', () => {
            UI.closeModal();
            this.openMapForm(mapId);
        });

        content.querySelector('#deleteMapBtn').addEventListener('click', () => {
            UI.confirm(`Delete map "${map.name}"? All pins will be lost.`, () => {
                DataManager.deleteEntity('maps', mapId);
                UI.showToast('Map deleted', 'warning');
                if (this.currentMapId === mapId) {
                    this.currentMapId = null;
                    document.getElementById('mapCanvas').innerHTML = '<div class="map-placeholder">Select or add a map to begin</div>';
                }
                UI.closeModal();
                this.renderMapList();
            });
        });
    },

    showPinContextMenu(e, pin) {
        this.openPinDetail(pin);
    }
};