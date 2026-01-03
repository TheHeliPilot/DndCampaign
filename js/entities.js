// DM Screen - Entities Module

const Entities = {
    // Entity form configurations
    formConfigs: {
        npcs: {
            title: 'NPC',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'title', label: 'Title/Role', type: 'text', placeholder: 'e.g., Blacksmith, Captain of the Guard' },
                { name: 'race', label: 'Race', type: 'select', options: ['Human', 'Elf', 'Dwarf', 'Halfling', 'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn', 'Gnome', 'Other'] },
                { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Non-binary', 'Unknown'] },
                { name: 'class', label: 'Class/Profession', type: 'text' },
                { name: 'occupation', label: 'Occupation', type: 'text' },
                { name: 'disposition', label: 'Disposition', type: 'select', options: ['friendly', 'neutral', 'hostile', 'unknown'] },
                { name: 'description', label: 'Physical Description', type: 'textarea' },
                { name: 'personality', label: 'Personality Traits', type: 'textarea' },
                { name: 'background', label: 'Background', type: 'textarea' },
                { name: 'roleplayGuide', label: 'Roleplay Guide', type: 'textarea', rows: 8, secret: true },
                { name: 'voice', label: 'Voice/Mannerisms', type: 'textarea', placeholder: 'How do they talk? Any distinctive behaviors?' },
                { name: 'allegiances', label: 'Allegiances/Factions', type: 'text' },
                { name: 'ac', label: 'AC', type: 'number', group: 'stats' },
                { name: 'hp', label: 'HP', type: 'number', group: 'stats' },
                { name: 'abilities', label: 'Key Abilities', type: 'text', group: 'stats', placeholder: 'e.g., STR 16, DEX 14' },
                { name: 'secrets', label: 'Secrets (DM Only)', type: 'textarea', secret: true },
                { name: 'consequences', label: 'Consequences', type: 'textarea', secret: true },
                { name: 'portrait', label: 'Portrait URL', type: 'url' },
                { name: 'locationIds', label: 'Locations', type: 'links', linkType: 'locations' },
                { name: 'questIds', label: 'Related Quests', type: 'links', linkType: 'quests' },
                { name: 'notes', label: 'Notes', type: 'textarea' },
                { name: 'tags', label: 'Tags', type: 'textarea', placeholder: 'One tag per line or comma-separated' },
                { name: 'dialogueExamples', label: 'Example Dialogue', type: 'textarea', rows: 4, placeholder: 'One example per line' }
            ]
        },
        locations: {
            title: 'Location',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Capital City', 'City', 'Town', 'Village', 'Hamlet', 'Settlement', 'Outpost', 'Fort', 'Ruins', 'Dungeon', 'Landmark', 'Wilderness Area', 'Other'] },
                { name: 'parentLocationId', label: 'Parent Location/Region', type: 'link', linkType: 'locations' },
                { name: 'region', label: 'Region', type: 'text', placeholder: 'e.g., Central Lowlands, Northern Mountains' },
                { name: 'population', label: 'Population', type: 'text' },
                { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Atmosphere, key features, what makes this place unique?' },
                { name: 'history', label: 'History', type: 'textarea', placeholder: 'Historical background and lore' },
                { name: 'features', label: 'Notable Features', type: 'textarea', placeholder: 'One feature per line' },
                { name: 'pointsOfInterest', label: 'Points of Interest', type: 'textarea', placeholder: 'Specific locations within this area' },
                { name: 'secrets', label: 'Secrets (DM Only)', type: 'textarea', secret: true },
                { name: 'npcIds', label: 'NPCs Here', type: 'links', linkType: 'npcs' },
                { name: 'shopIds', label: 'Shops/Establishments', type: 'links', linkType: 'shops' },
                { name: 'questIds', label: 'Related Quests', type: 'links', linkType: 'quests' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        },
        shops: {
            title: 'Shop/Establishment',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Tavern', 'Inn', 'Blacksmith', 'General Store', 'Magic Shop', 'Temple', 'Guild Hall', 'Black Market', 'Apothecary', 'Armorer', 'Jeweler', 'Library', 'Other'] },
                { name: 'locationId', label: 'Location', type: 'link', linkType: 'locations' },
                { name: 'ownerId', label: 'Owner/Proprietor', type: 'link', linkType: 'npcs' },
                { name: 'staffIds', label: 'Staff', type: 'links', linkType: 'npcs' },
                { name: 'description', label: 'Description/Atmosphere', type: 'textarea' },
                { name: 'specialties', label: 'Specialties', type: 'textarea', placeholder: 'What makes this place special or unique' },
                { name: 'inventory', label: 'Inventory/Services', type: 'textarea', placeholder: 'List items or services offered' },
                { name: 'priceModifier', label: 'Price Modifier (%)', type: 'number', placeholder: '100 = normal prices' },
                { name: 'hours', label: 'Operating Hours', type: 'text', placeholder: 'e.g., Dawn to Dusk' },
                { name: 'roleplayGuide', label: 'Roleplay Guide (DM Only)', type: 'textarea', secret: true, rows: 6, placeholder: 'How to roleplay this establishment' },
                { name: 'questIds', label: 'Related Quests', type: 'links', linkType: 'quests' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        },
        quests: {
            title: 'Quest',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Main', 'Side', 'Personal', 'Faction', 'Bounty', 'Errand', 'Other'] },
                { name: 'status', label: 'Status', type: 'select', options: ['Not Started', 'Available', 'Active', 'Completed', 'Failed', 'On Hold'] },
                { name: 'giverNpcId', label: 'Quest Giver', type: 'link', linkType: 'npcs' },
                { name: 'description', label: 'Description (What Party Knows)', type: 'textarea' },
                { name: 'background', label: 'Background (Full Context)', type: 'textarea', secret: true },
                { name: 'objectives', label: 'Objectives', type: 'objectives' },
                { name: 'rewards', label: 'Rewards', type: 'textarea' },
                { name: 'complications', label: 'Complications', type: 'textarea', secret: true },
                { name: 'consequences', label: 'Consequences', type: 'textarea', secret: true },
                { name: 'dmGuide', label: 'DM Guide', type: 'textarea', secret: true, rows: 8 },
                { name: 'runGuide', label: 'Run Guide (DM Notes)', type: 'textarea', secret: true, rows: 10 },
                { name: 'boxedText', label: 'Boxed Text (JSON format)', type: 'textarea', secret: true, rows: 6, placeholder: '{"introduction": "Read-aloud text here", "conclusion": "More text"}' },
                { name: 'secrets', label: 'Secrets', type: 'textarea', secret: true },
                { name: 'tags', label: 'Tags', type: 'textarea', placeholder: 'One tag per line or comma-separated' },
                { name: 'prerequisiteIds', label: 'Prerequisites', type: 'links', linkType: 'quests' },
                { name: 'npcIds', label: 'Related NPCs', type: 'links', linkType: 'npcs' },
                { name: 'locationIds', label: 'Related Locations', type: 'links', linkType: 'locations' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        },
        items: {
            title: 'Item',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'type', label: 'Type', type: 'select', options: ['Weapon', 'Armor', 'Potion', 'Scroll', 'Wondrous Item', 'Mundane', 'Quest Item', 'Currency', 'Other'] },
                { name: 'rarity', label: 'Rarity', type: 'select', options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'] },
                { name: 'description', label: 'Description', type: 'textarea' },
                { name: 'effects', label: 'Mechanical Effects', type: 'textarea' },
                { name: 'value', label: 'Value (gp)', type: 'number' },
                { name: 'weight', label: 'Weight (lb)', type: 'number' },
                { name: 'attunement', label: 'Requires Attunement', type: 'checkbox' },
                { name: 'image', label: 'Image URL', type: 'url' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        },
        lore: {
            title: 'Lore Entry',
            fields: [
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'category', label: 'Category', type: 'select', options: ['History', 'Religion', 'Faction', 'Legend', 'Geography', 'Magic', 'Custom'], editable: true },
                { name: 'content', label: 'Content', type: 'textarea', rows: 10 },
                { name: 'relatedNpcIds', label: 'Related NPCs', type: 'links', linkType: 'npcs' },
                { name: 'relatedLocationIds', label: 'Related Locations', type: 'links', linkType: 'locations' },
                { name: 'relatedQuestIds', label: 'Related Quests', type: 'links', linkType: 'quests' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        },
        pcs: {
            title: 'Player Character',
            fields: [
                { name: 'name', label: 'Character Name', type: 'text', required: true },
                { name: 'playerName', label: 'Player Name', type: 'text' },
                { name: 'concept', label: 'Concept', type: 'text', placeholder: 'e.g., The Fallen Knight, The Hidden Faithful' },
                { name: 'race', label: 'Race', type: 'select', options: ['Human', 'Human (Osmonti)', 'Elf', 'Dwarf', 'Halfling', 'Half-Elf', 'Half-Orc', 'Gnome', 'Other'] },
                { name: 'class', label: 'Class', type: 'select', options: ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'] },
                { name: 'subclass', label: 'Subclass', type: 'text' },
                { name: 'level', label: 'Level', type: 'number' },
                { name: 'background', label: 'Background', type: 'text' },
                { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'dead', 'retired'] },
                { name: 'summary', label: 'Summary', type: 'textarea', placeholder: 'Brief character concept and hook' },
                { name: 'backstory', label: 'Backstory', type: 'textarea', rows: 8 },
                { name: 'personalQuestName', label: 'Personal Quest', type: 'text' },
                { name: 'personalQuestDescription', label: 'Quest Description', type: 'textarea' },
                { name: 'personalQuestObjectives', label: 'Quest Objectives', type: 'textarea', placeholder: 'One objective per line' },
                { name: 'playerChoices', label: 'Player Choices', type: 'textarea', placeholder: 'What the player gets to decide' },
                { name: 'startingEquipment', label: 'Starting Equipment', type: 'textarea' },
                { name: 'statBlock', label: 'Stats', type: 'textarea', placeholder: 'STR, DEX, CON, INT, WIS, CHA, AC, HP' },
                { name: 'features', label: 'Class Features', type: 'textarea' },
                { name: 'proficiencies', label: 'Proficiencies', type: 'textarea' },
                { name: 'roleplayNotes', label: 'Roleplay Notes', type: 'textarea' },
                { name: 'npcConnections', label: 'Connected NPCs', type: 'links', linkType: 'npcs' },
                { name: 'locationConnections', label: 'Connected Locations', type: 'links', linkType: 'locations' },
                { name: 'questConnections', label: 'Connected Quests', type: 'links', linkType: 'quests' },
                { name: 'portrait', label: 'Portrait URL', type: 'url' },
                { name: 'sessionNotes', label: 'Session Notes', type: 'textarea', rows: 6 }
            ]
        },
        factions: {
            title: 'Faction',
            fields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'What this faction is about' },
                { name: 'headquarters', label: 'Headquarters', type: 'text', placeholder: 'Where they are based' },
                { name: 'leader', label: 'Leader', type: 'text', placeholder: 'Who leads this faction' },
                { name: 'goals', label: 'Goals', type: 'textarea', placeholder: 'What they want to accomplish' },
                { name: 'allies', label: 'Allies', type: 'textarea', placeholder: 'Other factions or groups they work with' },
                { name: 'enemies', label: 'Enemies', type: 'textarea', placeholder: 'Who opposes them' },
                { name: 'resources', label: 'Resources', type: 'textarea', placeholder: 'What they have access to' },
                { name: 'secrets', label: 'Secrets (DM Only)', type: 'textarea', secret: true },
                { name: 'currentReputation', label: 'Current Party Reputation', type: 'number', placeholder: '0' },
                { name: 'keyNpcIds', label: 'Key NPCs', type: 'links', linkType: 'npcs' },
                { name: 'locationIds', label: 'Related Locations', type: 'links', linkType: 'locations' },
                { name: 'questIds', label: 'Related Quests', type: 'links', linkType: 'quests' },
                { name: 'loreReference', label: 'Lore Reference', type: 'textarea', placeholder: 'References to lore entries' },
                { name: 'notes', label: 'Notes', type: 'textarea' }
            ]
        }
    },

    // Initialize entity lists
    init() {
        this.setupEntityButtons();
        this.setupSearchAndFilters();
    },

    setupEntityButtons() {
        // Add NPC button
        document.getElementById('addNpcBtn')?.addEventListener('click', () => this.openEntityForm('npcs'));
        document.getElementById('addLocationBtn')?.addEventListener('click', () => this.openEntityForm('locations'));
        document.getElementById('addShopBtn')?.addEventListener('click', () => this.openEntityForm('shops'));
        document.getElementById('addQuestBtn')?.addEventListener('click', () => this.openEntityForm('quests'));
        document.getElementById('addItemBtn')?.addEventListener('click', () => this.openEntityForm('items'));
        document.getElementById('addLoreBtn')?.addEventListener('click', () => this.openEntityForm('lore'));
        document.getElementById('addPcBtn')?.addEventListener('click', () => this.openEntityForm('pcs'));
        document.getElementById('addFactionBtn')?.addEventListener('click', () => this.openEntityForm('factions'));
    },

    setupSearchAndFilters() {
        // NPC search and filter
        const npcSearch = document.getElementById('npcSearch');
        const npcFilter = document.getElementById('npcFilterDisposition');
        if (npcSearch) {
            npcSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('npcs'), 200));
        }
        if (npcFilter) {
            npcFilter.addEventListener('change', () => this.renderEntityList('npcs'));
        }

        // Location search and filter
        const locationSearch = document.getElementById('locationSearch');
        const locationFilter = document.getElementById('locationFilterType');
        if (locationSearch) {
            locationSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('locations'), 200));
        }
        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.renderEntityList('locations'));
        }

        // Shop search and filter
        const shopSearch = document.getElementById('shopSearch');
        const shopFilter = document.getElementById('shopFilterType');
        if (shopSearch) {
            shopSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('shops'), 200));
        }
        if (shopFilter) {
            shopFilter.addEventListener('change', () => this.renderEntityList('shops'));
        }

        // Quest search and filters
        const questSearch = document.getElementById('questSearch');
        const questStatusFilter = document.getElementById('questFilterStatus');
        const questTypeFilter = document.getElementById('questFilterType');
        if (questSearch) {
            questSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('quests'), 200));
        }
        if (questStatusFilter) {
            questStatusFilter.addEventListener('change', () => this.renderEntityList('quests'));
        }
        if (questTypeFilter) {
            questTypeFilter.addEventListener('change', () => this.renderEntityList('quests'));
        }

        // Item search and filters
        const itemSearch = document.getElementById('itemSearch');
        const itemTypeFilter = document.getElementById('itemFilterType');
        const itemRarityFilter = document.getElementById('itemFilterRarity');
        if (itemSearch) {
            itemSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('items'), 200));
        }
        if (itemTypeFilter) {
            itemTypeFilter.addEventListener('change', () => this.renderEntityList('items'));
        }
        if (itemRarityFilter) {
            itemRarityFilter.addEventListener('change', () => this.renderEntityList('items'));
        }

        // Lore search and filter
        const loreSearch = document.getElementById('loreSearch');
        const loreFilter = document.getElementById('loreFilterCategory');
        if (loreSearch) {
            loreSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('lore'), 200));
        }
        if (loreFilter) {
            loreFilter.addEventListener('change', () => this.renderEntityList('lore'));
        }

        // PC search and filter
        const pcSearch = document.getElementById('pcSearch');
        const pcStatusFilter = document.getElementById('pcFilterStatus');
        const pcClassFilter = document.getElementById('pcFilterClass');
        if (pcSearch) {
            pcSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('pcs'), 200));
        }
        if (pcStatusFilter) {
            pcStatusFilter.addEventListener('change', () => this.renderEntityList('pcs'));
        }
        if (pcClassFilter) {
            pcClassFilter.addEventListener('change', () => this.renderEntityList('pcs'));
        }

        // Faction search
        const factionSearch = document.getElementById('factionSearch');
        if (factionSearch) {
            factionSearch.addEventListener('input', Utils.debounce(() => this.renderEntityList('factions'), 200));
        }
    },

    // Render entity list
    renderEntityList(type) {
        // Map type to correct list element ID
        const listIdMap = {
            npcs: 'npcList',
            locations: 'locationList',
            shops: 'shopList',
            quests: 'questList',
            items: 'itemList',
            lore: 'loreList',
            pcs: 'pcList',
            factions: 'factionList'
        };
        const listEl = document.getElementById(listIdMap[type]);
        if (!listEl) return;

        // Get search and filter values
        let query = '';
        let filters = {};

        switch (type) {
            case 'npcs':
                query = document.getElementById('npcSearch')?.value || '';
                filters.disposition = document.getElementById('npcFilterDisposition')?.value || '';
                break;
            case 'locations':
                query = document.getElementById('locationSearch')?.value || '';
                filters.type = document.getElementById('locationFilterType')?.value || '';
                break;
            case 'shops':
                query = document.getElementById('shopSearch')?.value || '';
                filters.type = document.getElementById('shopFilterType')?.value || '';
                break;
            case 'quests':
                query = document.getElementById('questSearch')?.value || '';
                filters.status = document.getElementById('questFilterStatus')?.value || '';
                filters.type = document.getElementById('questFilterType')?.value || '';
                break;
            case 'items':
                query = document.getElementById('itemSearch')?.value || '';
                filters.type = document.getElementById('itemFilterType')?.value || '';
                filters.rarity = document.getElementById('itemFilterRarity')?.value || '';
                break;
            case 'lore':
                query = document.getElementById('loreSearch')?.value || '';
                filters.category = document.getElementById('loreFilterCategory')?.value || '';
                break;
            case 'pcs':
                query = document.getElementById('pcSearch')?.value || '';
                filters.status = document.getElementById('pcFilterStatus')?.value || '';
                filters.class = document.getElementById('pcFilterClass')?.value || '';
                break;
            case 'factions':
                query = document.getElementById('factionSearch')?.value || '';
                break;
        }

        const entities = DataManager.searchEntities(type, query, filters);

        if (entities.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${Utils.getEntityIcon(type)}</div>
                    <div class="empty-state-text">No ${Utils.getEntityTypeName(type)} found</div>
                </div>
            `;
            return;
        }

        listEl.innerHTML = entities.map(entity => this.renderEntityCard(type, entity)).join('');

        // Add click handlers
        listEl.querySelectorAll('.entity-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.entity-card-actions')) {
                    this.viewEntity(type, card.dataset.id);
                }
            });
        });

        // Add action button handlers
        listEl.querySelectorAll('.edit-entity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEntityForm(type, btn.dataset.id);
            });
        });

        listEl.querySelectorAll('.delete-entity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteEntity(type, btn.dataset.id);
            });
        });
    },

    // Render single entity card
    renderEntityCard(type, entity) {
        let subtitle = '';
        let tags = '';
        let description = '';

        switch (type) {
            case 'npcs':
                subtitle = [entity.title, entity.race].filter(Boolean).join(' • ');
                if (entity.disposition) {
                    tags = `<span class="tag ${Utils.getDispositionClass(entity.disposition)}">${entity.disposition}</span>`;
                }
                description = entity.description;
                break;
            case 'locations':
                subtitle = entity.type || '';
                if (entity.population) {
                    subtitle += ` • Pop: ${entity.population}`;
                }
                description = entity.description;
                break;
            case 'shops':
                subtitle = entity.type || '';
                const location = entity.locationId ? DataManager.getEntity('locations', entity.locationId) : null;
                if (location) {
                    subtitle += ` • ${location.name}`;
                }
                description = entity.description;
                break;
            case 'quests':
                subtitle = entity.type || '';
                tags = `<span class="tag ${Utils.getStatusClass(entity.status)}">${entity.status}</span>`;
                description = entity.description;
                break;
            case 'items':
                subtitle = entity.type || '';
                if (entity.value) {
                    subtitle += ` • ${entity.value} gp`;
                }
                tags = `<span class="tag ${Utils.getRarityClass(entity.rarity)}">${entity.rarity}</span>`;
                description = entity.description;
                break;
            case 'lore':
                subtitle = entity.category || '';
                description = entity.content;
                break;
            case 'pcs':
                subtitle = [entity.class, entity.race].filter(Boolean).join(' • ');
                if (entity.level) {
                    subtitle += ` • Level ${entity.level}`;
                }
                const statusColors = {
                    'active': 'tag-friendly',
                    'inactive': 'tag-neutral',
                    'dead': 'tag-hostile',
                    'retired': 'tag-unknown'
                };
                tags = `<span class="tag ${statusColors[entity.status] || 'tag-neutral'}">${entity.status || 'active'}</span>`;
                if (entity.playerName) {
                    tags += ` <span class="tag tag-neutral">${Utils.escapeHtml(entity.playerName)}</span>`;
                }
                description = entity.concept || entity.summary;
                break;
            case 'factions':
                subtitle = entity.headquarters || '';
                if (entity.leader) {
                    subtitle += (subtitle ? ' • ' : '') + `Leader: ${entity.leader}`;
                }
                description = entity.description;
                const rep = entity.currentReputation || entity.reputationTrack?.current || 0;
                const repColor = rep >= 10 ? 'tag-friendly' : rep >= 5 ? 'tag-neutral' : rep < 0 ? 'tag-hostile' : 'tag-unknown';
                tags = `<span class="tag ${repColor}">Rep: ${rep >= 0 ? '+' : ''}${rep}</span>`;
                break;
        }

        const portrait = (type === 'npcs' && entity.portrait) || (type === 'items' && entity.image) || (type === 'pcs' && entity.portrait);

        const singularType = type.replace(/s$/, '');
        const defaultIcon = `<div class="entity-card-portrait entity-card-icon"><i class="icon icon-${singularType} icon-lg"></i></div>`;

        return `
            <div class="entity-card" data-id="${entity.id}" data-type="${type}">
                <div class="entity-card-header">
                    ${portrait ? `<img src="${Utils.escapeHtml(portrait)}" alt="" class="entity-card-portrait">` : defaultIcon}
                    <div class="entity-card-info">
                        <div class="entity-card-name">${Utils.escapeHtml(entity.name || entity.title)}</div>
                        ${subtitle ? `<div class="entity-card-subtitle">${Utils.escapeHtml(subtitle)}</div>` : ''}
                    </div>
                </div>
                ${tags ? `<div class="entity-card-tags">${tags}</div>` : ''}
                ${description ? `<div class="entity-card-description">${Utils.escapeHtml(description)}</div>` : ''}
                <div class="entity-card-footer">
                    <div class="entity-card-links"></div>
                    <div class="entity-card-actions">
                        <button class="btn btn-small btn-ghost edit-entity-btn" data-id="${entity.id}" title="Edit"><i class="icon icon-edit"></i></button>
                        <button class="btn btn-small btn-ghost delete-entity-btn" data-id="${entity.id}" title="Delete"><i class="icon icon-delete"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    // View entity details
    viewEntity(type, id) {
        const entity = DataManager.getEntity(type, id);
        if (!entity) return;

        const config = this.formConfigs[type];
        const linkedEntities = DataManager.getLinkedEntities(type, id);

        const content = document.createElement('div');

        // Build detail view based on type
        let detailHtml = '';

        switch (type) {
            case 'npcs':
                detailHtml = this.renderNpcDetail(entity, linkedEntities);
                break;
            case 'locations':
                detailHtml = this.renderLocationDetail(entity, linkedEntities);
                break;
            case 'shops':
                detailHtml = this.renderShopDetail(entity, linkedEntities);
                break;
            case 'quests':
                detailHtml = this.renderQuestDetail(entity, linkedEntities);
                break;
            case 'items':
                detailHtml = this.renderItemDetail(entity, linkedEntities);
                break;
            case 'lore':
                detailHtml = this.renderLoreDetail(entity, linkedEntities);
                break;
            case 'pcs':
                detailHtml = this.renderPcDetail(entity, linkedEntities);
                break;
            case 'factions':
                detailHtml = this.renderFactionDetail(entity, linkedEntities);
                break;
        }

        content.innerHTML = detailHtml;

        // Add click handlers for entity links
        content.querySelectorAll('.entity-link').forEach(link => {
            link.addEventListener('click', () => {
                UI.closeModal();
                this.viewEntity(link.dataset.type, link.dataset.id);
            });
        });

        const footer = document.createElement('div');
        footer.innerHTML = `
            <button class="btn btn-danger" id="deleteEntityBtn"><i class="icon icon-delete"></i> Delete</button>
            <button class="btn" id="undockEntityBtn" title="Open in new window"><i class="icon icon-undock"></i> Popout</button>
            <button class="btn" id="closeEntityBtn">Close</button>
            <button class="btn btn-primary" id="editEntityBtn"><i class="icon icon-edit"></i> Edit</button>
        `;

        UI.openModal({
            title: `${Utils.getEntityIcon(type)} ${entity.name || entity.title}`,
            content,
            footer,
            size: 'large'
        });

        footer.querySelector('#closeEntityBtn').addEventListener('click', () => UI.closeModal());
        footer.querySelector('#editEntityBtn').addEventListener('click', () => {
            UI.closeModal();
            this.openEntityForm(type, id);
        });
        footer.querySelector('#deleteEntityBtn').addEventListener('click', () => {
            this.deleteEntity(type, id);
        });
        footer.querySelector('#undockEntityBtn').addEventListener('click', () => {
            this.popoutEntity(type, id);
        });
    },

    // Popout entity to a new window
    popoutEntity(type, id) {
        const entity = DataManager.getEntity(type, id);
        if (!entity) return;

        const config = this.formConfigs[type];
        const linkedEntities = DataManager.getLinkedEntities(type, id);

        // Generate the detail HTML based on type
        let detailHtml = '';
        switch (type) {
            case 'npcs':
                detailHtml = this.renderNpcDetail(entity, linkedEntities);
                break;
            case 'locations':
                detailHtml = this.renderLocationDetail(entity, linkedEntities);
                break;
            case 'shops':
                detailHtml = this.renderShopDetail(entity, linkedEntities);
                break;
            case 'quests':
                detailHtml = this.renderQuestDetail(entity, linkedEntities);
                break;
            case 'items':
                detailHtml = this.renderItemDetail(entity, linkedEntities);
                break;
            case 'lore':
                detailHtml = this.renderLoreDetail(entity, linkedEntities);
                break;
            case 'pcs':
                detailHtml = this.renderPcDetail(entity, linkedEntities);
                break;
            case 'factions':
                detailHtml = this.renderFactionDetail(entity, linkedEntities);
                break;
        }

        // Create popup window HTML
        const popupHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Utils.escapeHtml(entity.name || entity.title)} - DM Screen</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/entities.css">
    <link rel="stylesheet" href="css/icons.css">
    <style>
        body {
            padding: var(--spacing-lg);
            min-height: 100vh;
        }
        .popout-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding-bottom: var(--spacing-md);
            border-bottom: 1px solid var(--border);
            margin-bottom: var(--spacing-lg);
        }
        .popout-header h1 {
            font-family: var(--font-header);
            font-size: 1.5rem;
            margin: 0;
        }
        .popout-actions {
            margin-left: auto;
            display: flex;
            gap: var(--spacing-sm);
        }
        .entity-link {
            cursor: default;
            opacity: 0.7;
        }
    </style>
</head>
<body>
    <div class="popout-header">
        <h1>${Utils.getEntityIcon(type)} ${Utils.escapeHtml(entity.name || entity.title)}</h1>
        <span class="tag">${config.title}</span>
        <div class="popout-actions">
            <button class="btn btn-small" onclick="window.print()"><i class="icon icon-file"></i> Print</button>
            <button class="btn btn-small" onclick="window.close()"><i class="icon icon-close"></i> Close</button>
        </div>
    </div>
    ${detailHtml}
</body>
</html>
        `;

        // Open new window
        const popupWindow = window.open('', '_blank', 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no');
        if (popupWindow) {
            popupWindow.document.write(popupHtml);
            popupWindow.document.close();
            UI.showToast('Entity opened in new window', 'success');
        } else {
            UI.showToast('Popup blocked - please allow popups for this site', 'error');
        }
    },

    renderNpcDetail(entity, linked) {
        // Direct links FROM this NPC
        const locations = (entity.locationIds || []).map(id => DataManager.getEntity('locations', id)).filter(Boolean);
        const quests = (entity.questIds || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);
        const shop = entity.shopId ? DataManager.getEntity('shops', entity.shopId) : null;

        // Collect IDs we're showing directly to avoid duplication in "Referenced By"
        const shownIds = new Set([
            ...locations.map(e => e.id),
            ...quests.map(e => e.id),
            ...(shop ? [shop.id] : [])
        ]);

        // Check if any DM-only sections exist
        const hasDmContent = entity.roleplayGuide || entity.secrets || entity.consequences || entity.background;

        return `
            <div class="entity-detail">
                <div>
                    ${entity.portrait ? `<img src="${Utils.escapeHtml(entity.portrait)}" alt="${Utils.escapeHtml(entity.name)}" class="entity-detail-portrait">` : '<div class="entity-detail-portrait" style="display:flex;align-items:center;justify-content:center;font-size:3rem;"><i class="icon icon-npcs"></i></div>'}
                    ${entity.disposition ? `<div style="text-align:center;margin-top:var(--spacing-sm);"><span class="tag ${Utils.getDispositionClass(entity.disposition)}">${entity.disposition}</span></div>` : ''}
                </div>
                <div class="entity-detail-main">
                    <div class="entity-detail-header">
                        <h2>${Utils.escapeHtml(entity.name)}</h2>
                        <div class="entity-detail-subtitle">${Utils.escapeHtml([entity.title || entity.occupation, entity.race, entity.class].filter(Boolean).join(' • '))}</div>
                    </div>

                    ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}
                    ${entity.personality ? `<div class="entity-detail-section"><h3>Personality</h3><div class="md-content">${Utils.parseMarkdown(entity.personality)}</div></div>` : ''}
                    ${entity.voice ? `<div class="entity-detail-section"><h3>Voice/Mannerisms</h3><div class="md-content">${Utils.parseMarkdown(entity.voice)}</div></div>` : ''}
                    ${entity.allegiances ? `<div class="entity-detail-section"><h3>Allegiances</h3><p>${Utils.escapeHtml(entity.allegiances)}</p></div>` : ''}

                    ${(entity.ac || entity.hp || entity.abilities) ? `
                        <div class="entity-detail-section">
                            <h3>Stats</h3>
                            <div class="stats-block">
                                ${entity.ac ? `<div class="stat-item"><div class="stat-label">AC</div><div class="stat-value">${entity.ac}</div></div>` : ''}
                                ${entity.hp ? `<div class="stat-item"><div class="stat-label">HP</div><div class="stat-value">${entity.hp}</div></div>` : ''}
                                ${entity.abilities ? `<div class="stat-item" style="grid-column: span 3;"><div class="stat-label">Abilities</div><div class="stat-value" style="font-size:0.9rem;">${Utils.escapeHtml(entity.abilities)}</div></div>` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}

                    ${entity.tags && entity.tags.length > 0 ? `
                        <div class="entity-detail-section">
                            <h3>Tags</h3>
                            <div class="entity-tags-display">
                                ${entity.tags.map(tag => `<span class="tag tag-neutral">${Utils.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${entity.dialogueExamples && entity.dialogueExamples.length > 0 ? `
                        <div class="entity-detail-section">
                            <h3>Example Dialogue</h3>
                            <div class="dialogue-examples">
                                ${entity.dialogueExamples.map(dialogue => `
                                    <div class="dialogue-item">
                                        <i class="icon icon-chat"></i>
                                        <span class="dialogue-text">"${Utils.escapeHtml(dialogue)}"</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${hasDmContent ? `
                        <div class="entity-detail-dm-section">
                            <h3 class="dm-section-header"><i class="icon icon-warning"></i> DM Only</h3>

                            ${entity.background ? `
                                <details class="dm-collapsible" open>
                                    <summary>Background</summary>
                                    <div class="dm-content md-content">${Utils.parseMarkdown(entity.background)}</div>
                                </details>
                            ` : ''}

                            ${entity.roleplayGuide ? `
                                <details class="dm-collapsible" open>
                                    <summary>Roleplay Guide</summary>
                                    <div class="dm-content md-content">${Utils.parseMarkdown(entity.roleplayGuide)}</div>
                                </details>
                            ` : ''}

                            ${entity.secrets ? `
                                <details class="dm-collapsible">
                                    <summary>Secrets</summary>
                                    <div class="dm-content md-content">${Utils.parseMarkdown(entity.secrets)}</div>
                                </details>
                            ` : ''}

                            ${entity.consequences ? `
                                <details class="dm-collapsible">
                                    <summary>Consequences</summary>
                                    <div class="dm-content md-content">${Utils.parseMarkdown(entity.consequences)}</div>
                                </details>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${(locations.length > 0 || quests.length > 0 || shop) ? `
                        <div class="entity-detail-section">
                            <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${locations.length + quests.length + (shop ? 1 : 0)}</span></h3>
                            <div class="entity-links-grid">
                                ${locations.length > 0 ? `
                                    <div class="links-group links-locations">
                                        <div class="links-group-label"><i class="icon icon-locations"></i> Locations</div>
                                        <div class="entity-links-list">
                                            ${locations.map(l => `<span class="entity-link" data-type="locations" data-id="${l.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(l.name)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${quests.length > 0 ? `
                                    <div class="links-group links-quests">
                                        <div class="links-group-label"><i class="icon icon-quests"></i> Related Quests</div>
                                        <div class="entity-links-list">
                                            ${quests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${shop ? `
                                    <div class="links-group links-shops">
                                        <div class="links-group-label"><i class="icon icon-shops"></i> Works At</div>
                                        <div class="entity-links-list">
                                            <span class="entity-link" data-type="shops" data-id="${shop.id}"><i class="icon icon-shop"></i> ${Utils.escapeHtml(shop.name)}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${this.renderReferencedBy(linked, shownIds)}
                </div>
            </div>
        `;
    },

    renderLocationDetail(entity, linked) {
        const parent = entity.parentLocationId ? DataManager.getEntity('locations', entity.parentLocationId) : null;
        const npcs = (entity.npcIds || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const shops = (entity.shopIds || []).map(id => DataManager.getEntity('shops', id)).filter(Boolean);
        const quests = (entity.questIds || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);

        // Collect shown IDs
        const shownIds = new Set([
            ...(parent ? [parent.id] : []),
            ...npcs.map(e => e.id),
            ...shops.map(e => e.id),
            ...quests.map(e => e.id)
        ]);

        const hasConnections = parent || npcs.length > 0 || shops.length > 0 || quests.length > 0;

        return `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2>${Utils.escapeHtml(entity.name)}</h2>
                    <div class="entity-detail-subtitle">
                        ${entity.type || 'Location'}${entity.region ? ` • ${Utils.escapeHtml(entity.region)}` : ''}
                        ${entity.population ? ` • Pop: ${Utils.escapeHtml(entity.population)}` : ''}
                    </div>
                </div>

                ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}
                ${entity.history ? `<div class="entity-detail-section"><h3>History</h3><div class="md-content">${Utils.parseMarkdown(entity.history)}</div></div>` : ''}
                ${entity.features ? `<div class="entity-detail-section"><h3>Notable Features</h3><div class="md-content">${Utils.parseMarkdown(entity.features)}</div></div>` : ''}
                ${entity.pointsOfInterest ? `<div class="entity-detail-section"><h3>Points of Interest</h3><div class="md-content">${Utils.parseMarkdown(entity.pointsOfInterest)}</div></div>` : ''}
                ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}
                ${entity.secrets ? `<div class="entity-detail-section entity-detail-secret"><h3><i class="icon icon-warning"></i> Secrets (DM Only)</h3><div class="md-content">${Utils.parseMarkdown(entity.secrets)}</div></div>` : ''}

                ${hasConnections ? `
                    <div class="entity-detail-section">
                        <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${(parent ? 1 : 0) + npcs.length + shops.length + quests.length}</span></h3>
                        <div class="entity-links-grid">
                            ${parent ? `
                                <div class="links-group links-locations">
                                    <div class="links-group-label"><i class="icon icon-locations"></i> Part Of</div>
                                    <div class="entity-links-list">
                                        <span class="entity-link" data-type="locations" data-id="${parent.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(parent.name)}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${npcs.length > 0 ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> NPCs Here</div>
                                    <div class="entity-links-list">
                                        ${npcs.map(n => `<span class="entity-link" data-type="npcs" data-id="${n.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(n.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${shops.length > 0 ? `
                                <div class="links-group links-shops">
                                    <div class="links-group-label"><i class="icon icon-shops"></i> Establishments</div>
                                    <div class="entity-links-list">
                                        ${shops.map(s => `<span class="entity-link" data-type="shops" data-id="${s.id}"><i class="icon icon-shop"></i> ${Utils.escapeHtml(s.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${quests.length > 0 ? `
                                <div class="links-group links-quests">
                                    <div class="links-group-label"><i class="icon icon-quests"></i> Related Quests</div>
                                    <div class="entity-links-list">
                                        ${quests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${this.renderReferencedBy(linked, shownIds)}
            </div>
        `;
    },

    renderShopDetail(entity, linked) {
        const location = entity.locationId ? DataManager.getEntity('locations', entity.locationId) : null;
        const owner = entity.ownerId ? DataManager.getEntity('npcs', entity.ownerId) : null;
        const staff = (entity.staffIds || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const quests = (entity.questIds || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);

        // Collect shown IDs
        const shownIds = new Set([
            ...(location ? [location.id] : []),
            ...(owner ? [owner.id] : []),
            ...staff.map(e => e.id),
            ...quests.map(e => e.id)
        ]);

        const hasConnections = location || owner || staff.length > 0 || quests.length > 0;

        return `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2>${Utils.escapeHtml(entity.name)}</h2>
                    <div class="entity-detail-subtitle">${entity.type || 'Establishment'}</div>
                </div>

                ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}
                ${entity.specialties ? `<div class="entity-detail-section"><h3>Specialties</h3><div class="md-content">${Utils.parseMarkdown(entity.specialties)}</div></div>` : ''}
                ${entity.inventory ? `<div class="entity-detail-section"><h3>Inventory/Services</h3><div class="md-content">${Utils.parseMarkdown(entity.inventory)}</div></div>` : ''}

                ${(entity.priceModifier || entity.hours) ? `
                    <div class="entity-detail-section">
                        <h3>Details</h3>
                        <p>
                            ${entity.priceModifier ? `<strong>Prices:</strong> ${entity.priceModifier}% of normal<br>` : ''}
                            ${entity.hours ? `<strong>Hours:</strong> ${Utils.escapeHtml(entity.hours)}` : ''}
                        </p>
                    </div>
                ` : ''}

                ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}
                
                ${entity.roleplayGuide ? `
                    <div class="entity-detail-section entity-detail-secret">
                        <h3><i class="icon icon-warning"></i> Roleplay Guide (DM Only)</h3>
                        <div class="md-content">${Utils.parseMarkdown(entity.roleplayGuide)}</div>
                    </div>
                ` : ''}

                ${hasConnections ? `
                    <div class="entity-detail-section">
                        <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${(location ? 1 : 0) + (owner ? 1 : 0) + staff.length + quests.length}</span></h3>
                        <div class="entity-links-grid">
                            ${location ? `
                                <div class="links-group links-locations">
                                    <div class="links-group-label"><i class="icon icon-locations"></i> Location</div>
                                    <div class="entity-links-list">
                                        <span class="entity-link" data-type="locations" data-id="${location.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(location.name)}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${owner ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Owner</div>
                                    <div class="entity-links-list">
                                        <span class="entity-link" data-type="npcs" data-id="${owner.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(owner.name)}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${staff.length > 0 ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Staff</div>
                                    <div class="entity-links-list">
                                        ${staff.map(s => `<span class="entity-link" data-type="npcs" data-id="${s.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(s.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${quests.length > 0 ? `
                                <div class="links-group links-quests">
                                    <div class="links-group-label"><i class="icon icon-quests"></i> Related Quests</div>
                                    <div class="entity-links-list">
                                        ${quests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${this.renderReferencedBy(linked, shownIds)}
            </div>
        `;
    },

    renderQuestDetail(entity, linked) {
        const giver = entity.giverNpcId ? DataManager.getEntity('npcs', entity.giverNpcId) : null;
        const prerequisites = (entity.prerequisites || entity.prerequisiteIds || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);
        const relatedNpcs = (entity.npcIds || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const relatedLocations = (entity.locationIds || []).map(id => DataManager.getEntity('locations', id)).filter(Boolean);

        // Collect shown IDs
        const shownIds = new Set([
            ...(giver ? [giver.id] : []),
            ...prerequisites.map(e => e.id),
            ...relatedNpcs.map(e => e.id),
            ...relatedLocations.map(e => e.id)
        ]);

        const hasConnections = giver || prerequisites.length > 0 || relatedNpcs.length > 0 || relatedLocations.length > 0;
        const hasDmContent = entity.background || entity.dmGuide || entity.runGuide || entity.boxedText || entity.complications || entity.consequences || entity.secrets;

        return `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2>${Utils.escapeHtml(entity.name)}</h2>
                    <div class="entity-detail-subtitle">
                        ${entity.type || 'Quest'} Quest
                        <span class="tag ${Utils.getStatusClass(entity.status)}" style="margin-left:var(--spacing-sm);">${entity.status}</span>
                    </div>
                </div>

                ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}

                ${entity.objectives && entity.objectives.length > 0 ? `
                    <div class="entity-detail-section">
                        <h3>Objectives</h3>
                        <div class="objectives-list">
                            ${entity.objectives.map((obj, i) => `
                                <div class="objective-item ${obj.completed ? 'completed' : ''}">
                                    <input type="checkbox" class="objective-checkbox" data-index="${i}" ${obj.completed ? 'checked' : ''}>
                                    <span class="objective-text">${Utils.escapeHtml(obj.text)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${entity.rewards ? `
                    <div class="entity-detail-section">
                        <h3>Rewards</h3>
                        ${typeof entity.rewards === 'object' ? `
                            <div class="rewards-display">
                                ${entity.rewards.gold ? `<div class="reward-item"><i class="icon icon-coins"></i> <strong>Gold:</strong> ${entity.rewards.gold} gp</div>` : ''}
                                ${entity.rewards.level ? `<div class="reward-item"><i class="icon icon-level"></i> <strong>Level:</strong> ${entity.rewards.level}</div>` : ''}
                                ${entity.rewards.reputation ? `<div class="reward-item"><i class="icon icon-reputation"></i> <strong>Reputation:</strong> ${Utils.escapeHtml(entity.rewards.reputation)}</div>` : ''}
                                ${entity.rewards.ally ? `<div class="reward-item"><i class="icon icon-npcs"></i> <strong>Ally:</strong> ${Utils.escapeHtml(entity.rewards.ally)}</div>` : ''}
                                ${entity.rewards.knowledge ? `<div class="reward-item"><i class="icon icon-lore"></i> <strong>Knowledge:</strong> ${Utils.escapeHtml(entity.rewards.knowledge)}</div>` : ''}
                                ${entity.rewards.items ? `<div class="reward-item"><i class="icon icon-items"></i> <strong>Items:</strong> ${Utils.escapeHtml(entity.rewards.items)}</div>` : ''}
                                ${entity.rewards.unlock ? `<div class="reward-item"><i class="icon icon-unlock"></i> <strong>Unlock:</strong> ${Utils.escapeHtml(entity.rewards.unlock)}</div>` : ''}
                                ${entity.rewards.consequence ? `<div class="reward-item"><i class="icon icon-warning"></i> <strong>Consequence:</strong> ${Utils.escapeHtml(entity.rewards.consequence)}</div>` : ''}
                                ${entity.rewards.other ? `<div class="reward-item"><i class="icon icon-star"></i> <strong>Other:</strong> ${Utils.escapeHtml(entity.rewards.other)}</div>` : ''}
                            </div>
                        ` : `
                            <div class="md-content">${Utils.parseMarkdown(entity.rewards)}</div>
                        `}
                    </div>
                ` : ''}

                ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}

                ${entity.tags && entity.tags.length > 0 ? `
                    <div class="entity-detail-section">
                        <h3>Tags</h3>
                        <div class="entity-tags-display">
                            ${entity.tags.map(tag => `<span class="tag tag-neutral">${Utils.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${hasDmContent ? `
                    <div class="entity-detail-dm-section">
                        <h3 class="dm-section-header"><i class="icon icon-warning"></i> DM Only</h3>
                        
                        ${entity.background ? `
                            <details class="dm-collapsible" open>
                                <summary>Background</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.background)}</div>
                            </details>
                        ` : ''}

                        ${entity.dmGuide ? `
                            <details class="dm-collapsible" open>
                                <summary>DM Guide</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.dmGuide)}</div>
                            </details>
                        ` : ''}

                        ${entity.runGuide ? `
                            <details class="dm-collapsible" open>
                                <summary>Run Guide</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.runGuide)}</div>
                            </details>
                        ` : ''}

                        ${entity.boxedText ? `
                            <details class="dm-collapsible" open>
                                <summary>Boxed Text (Read-Aloud)</summary>
                                <div class="dm-content boxed-text-sections">
                                    ${Object.entries(entity.boxedText).map(([key, text]) => `
                                        <div class="boxed-text-item">
                                            <h4 class="boxed-text-label">${Utils.escapeHtml(key.replace(/([A-Z])/g, ' $1').trim())}</h4>
                                            <div class="boxed-text-content">${Utils.escapeHtml(text)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </details>
                        ` : ''}

                        ${entity.complications ? `
                            <details class="dm-collapsible">
                                <summary>Complications</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.complications)}</div>
                            </details>
                        ` : ''}

                        ${entity.consequences ? `
                            <details class="dm-collapsible">
                                <summary>Consequences</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.consequences)}</div>
                            </details>
                        ` : ''}

                        ${entity.secrets ? `
                            <details class="dm-collapsible">
                                <summary>Secrets</summary>
                                <div class="dm-content md-content">${Utils.parseMarkdown(entity.secrets)}</div>
                            </details>
                        ` : ''}
                    </div>
                ` : ''}

                ${hasConnections ? `
                    <div class="entity-detail-section">
                        <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${(giver ? 1 : 0) + prerequisites.length + relatedNpcs.length + relatedLocations.length}</span></h3>
                        <div class="entity-links-grid">
                            ${giver ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Quest Giver</div>
                                    <div class="entity-links-list">
                                        <span class="entity-link" data-type="npcs" data-id="${giver.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(giver.name)}</span>
                                    </div>
                                </div>
                            ` : ''}
                            ${prerequisites.length > 0 ? `
                                <div class="links-group links-quests">
                                    <div class="links-group-label"><i class="icon icon-quests"></i> Prerequisites</div>
                                    <div class="entity-links-list">
                                        ${prerequisites.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${relatedNpcs.length > 0 ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Related NPCs</div>
                                    <div class="entity-links-list">
                                        ${relatedNpcs.map(n => `<span class="entity-link" data-type="npcs" data-id="${n.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(n.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${relatedLocations.length > 0 ? `
                                <div class="links-group links-locations">
                                    <div class="links-group-label"><i class="icon icon-locations"></i> Related Locations</div>
                                    <div class="entity-links-list">
                                        ${relatedLocations.map(l => `<span class="entity-link" data-type="locations" data-id="${l.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(l.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${this.renderReferencedBy(linked, shownIds)}
            </div>
        `;
    },

    renderItemDetail(entity, linked) {
        // Items don't have direct links, only reverse references
        const shownIds = new Set();

        return `
            <div class="entity-detail">
                <div>
                    ${entity.image ? `<img src="${Utils.escapeHtml(entity.image)}" alt="${Utils.escapeHtml(entity.name)}" class="entity-detail-portrait">` : '<div class="entity-detail-portrait" style="display:flex;align-items:center;justify-content:center;font-size:3rem;"><i class="icon icon-items"></i></div>'}
                    <div style="text-align:center;margin-top:var(--spacing-sm);">
                        <span class="tag ${Utils.getRarityClass(entity.rarity)}">${entity.rarity}</span>
                    </div>
                </div>
                <div class="entity-detail-main">
                    <div class="entity-detail-header">
                        <h2>${Utils.escapeHtml(entity.name)}</h2>
                        <div class="entity-detail-subtitle">${entity.type || 'Item'}</div>
                    </div>

                    ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}
                    ${entity.effects ? `<div class="entity-detail-section"><h3>Effects</h3><div class="md-content">${Utils.parseMarkdown(entity.effects)}</div></div>` : ''}

                    <div class="entity-detail-section">
                        <h3>Properties</h3>
                        <div class="stats-block">
                            ${entity.value ? `<div class="stat-item"><div class="stat-label">Value</div><div class="stat-value">${entity.value} gp</div></div>` : ''}
                            ${entity.weight ? `<div class="stat-item"><div class="stat-label">Weight</div><div class="stat-value">${entity.weight} lb</div></div>` : ''}
                            <div class="stat-item"><div class="stat-label">Attunement</div><div class="stat-value">${entity.attunement ? 'Yes' : 'No'}</div></div>
                        </div>
                    </div>

                    ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}

                    ${this.renderReferencedBy(linked, shownIds)}
                </div>
            </div>
        `;
    },

    renderLoreDetail(entity, linked) {
        // Get directly linked entities from lore-specific fields
        const relatedNpcs = (entity.relatedNpcIds || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const relatedLocations = (entity.relatedLocationIds || []).map(id => DataManager.getEntity('locations', id)).filter(Boolean);
        const relatedQuests = (entity.relatedQuestIds || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);

        // Collect shown IDs
        const shownIds = new Set([
            ...relatedNpcs.map(e => e.id),
            ...relatedLocations.map(e => e.id),
            ...relatedQuests.map(e => e.id)
        ]);

        const hasConnections = relatedNpcs.length > 0 || relatedLocations.length > 0 || relatedQuests.length > 0;

        return `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2>${Utils.escapeHtml(entity.title)}</h2>
                    <div class="entity-detail-subtitle">${entity.category || 'Lore'}</div>
                </div>

                <div class="entity-detail-section">
                    <div class="md-content">${Utils.parseMarkdown(entity.content)}</div>
                </div>

                ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}

                ${hasConnections ? `
                    <div class="entity-detail-section">
                        <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${relatedNpcs.length + relatedLocations.length + relatedQuests.length}</span></h3>
                        <div class="entity-links-grid">
                            ${relatedNpcs.length > 0 ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Related NPCs</div>
                                    <div class="entity-links-list">
                                        ${relatedNpcs.map(n => `<span class="entity-link" data-type="npcs" data-id="${n.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(n.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${relatedLocations.length > 0 ? `
                                <div class="links-group links-locations">
                                    <div class="links-group-label"><i class="icon icon-locations"></i> Related Locations</div>
                                    <div class="entity-links-list">
                                        ${relatedLocations.map(l => `<span class="entity-link" data-type="locations" data-id="${l.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(l.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${relatedQuests.length > 0 ? `
                                <div class="links-group links-quests">
                                    <div class="links-group-label"><i class="icon icon-quests"></i> Related Quests</div>
                                    <div class="entity-links-list">
                                        ${relatedQuests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${this.renderReferencedBy(linked, shownIds)}
            </div>
        `;
    },

    renderPcDetail(entity, linked) {
        // Get connected entities
        const connectedNpcs = (entity.npcConnections || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const connectedLocations = (entity.locationConnections || []).map(id => DataManager.getEntity('locations', id)).filter(Boolean);
        const connectedQuests = (entity.questConnections || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);

        const shownIds = new Set([
            ...connectedNpcs.map(e => e.id),
            ...connectedLocations.map(e => e.id),
            ...connectedQuests.map(e => e.id)
        ]);

        const hasConnections = connectedNpcs.length > 0 || connectedLocations.length > 0 || connectedQuests.length > 0;

        // Status badge color
        const statusColors = {
            'active': 'tag-friendly',
            'inactive': 'tag-neutral',
            'dead': 'tag-hostile',
            'retired': 'tag-unknown'
        };

        return `
            <div class="entity-detail">
                <div>
                    ${entity.portrait ? `<img src="${Utils.escapeHtml(entity.portrait)}" alt="${Utils.escapeHtml(entity.name)}" class="entity-detail-portrait">` : '<div class="entity-detail-portrait" style="display:flex;align-items:center;justify-content:center;font-size:3rem;"><i class="icon icon-npcs"></i></div>'}
                    <div style="text-align:center;margin-top:var(--spacing-sm);">
                        <span class="tag ${statusColors[entity.status] || 'tag-neutral'}">${entity.status || 'active'}</span>
                    </div>
                    ${entity.playerName ? `<div style="text-align:center;margin-top:var(--spacing-sm);color:var(--text-muted);font-size:0.85rem;">Player: ${Utils.escapeHtml(entity.playerName)}</div>` : ''}
                </div>
                <div class="entity-detail-main">
                    <div class="entity-detail-header">
                        <h2>${Utils.escapeHtml(entity.name || 'Unnamed Character')}</h2>
                        <div class="entity-detail-subtitle">
                            ${entity.concept ? `"${Utils.escapeHtml(entity.concept)}"` : ''}
                        </div>
                    </div>

                    <div class="entity-detail-section">
                        <div class="stats-block">
                            <div class="stat-item"><div class="stat-label">Race</div><div class="stat-value">${entity.race || '—'}</div></div>
                            <div class="stat-item"><div class="stat-label">Class</div><div class="stat-value">${entity.class || '—'}${entity.subclass ? ` (${entity.subclass})` : ''}</div></div>
                            <div class="stat-item"><div class="stat-label">Level</div><div class="stat-value">${entity.level || '—'}</div></div>
                            <div class="stat-item"><div class="stat-label">Background</div><div class="stat-value">${entity.background || '—'}</div></div>
                        </div>
                    </div>

                    ${entity.summary ? `<div class="entity-detail-section"><h3>Summary</h3><div class="md-content">${Utils.parseMarkdown(entity.summary)}</div></div>` : ''}
                    
                    ${entity.backstory ? `<div class="entity-detail-section"><h3>Backstory</h3><div class="md-content">${Utils.parseMarkdown(entity.backstory)}</div></div>` : ''}

                    ${entity.personalQuestName ? `
                        <div class="entity-detail-section" style="background: rgba(139, 107, 58, 0.1); padding: var(--spacing-md); border-radius: var(--radius-md); border-left: 3px solid var(--warning);">
                            <h3><i class="icon icon-quests"></i> Personal Quest: ${Utils.escapeHtml(entity.personalQuestName)}</h3>
                            ${entity.personalQuestDescription ? `<div class="md-content" style="margin-top:var(--spacing-sm);">${Utils.parseMarkdown(entity.personalQuestDescription)}</div>` : ''}
                            ${entity.personalQuestObjectives ? `
                                <div style="margin-top:var(--spacing-sm);">
                                    <strong>Objectives:</strong>
                                    <ul style="margin-top:var(--spacing-xs);margin-left:var(--spacing-md);">
                                        ${entity.personalQuestObjectives.split('\n').filter(o => o.trim()).map(o => `<li>${Utils.escapeHtml(o.trim())}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${entity.playerChoices ? `
                        <div class="entity-detail-section">
                            <h3>Player Choices</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.playerChoices)}</div>
                        </div>
                    ` : ''}

                    ${entity.statBlock ? `
                        <div class="entity-detail-section">
                            <h3>Stats</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.statBlock)}</div>
                        </div>
                    ` : ''}

                    ${entity.features ? `
                        <div class="entity-detail-section">
                            <h3>Class Features</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.features)}</div>
                        </div>
                    ` : ''}

                    ${entity.proficiencies ? `
                        <div class="entity-detail-section">
                            <h3>Proficiencies</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.proficiencies)}</div>
                        </div>
                    ` : ''}

                    ${entity.startingEquipment ? `
                        <div class="entity-detail-section">
                            <h3>Starting Equipment</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.startingEquipment)}</div>
                        </div>
                    ` : ''}

                    ${entity.roleplayNotes ? `
                        <div class="entity-detail-section">
                            <h3>Roleplay Notes</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.roleplayNotes)}</div>
                        </div>
                    ` : ''}

                    ${entity.sessionNotes ? `
                        <div class="entity-detail-section entity-detail-secret">
                            <h3><i class="icon icon-notes"></i> Session Notes</h3>
                            <div class="md-content">${Utils.parseMarkdown(entity.sessionNotes)}</div>
                        </div>
                    ` : ''}

                    ${hasConnections ? `
                        <div class="entity-detail-section">
                            <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${connectedNpcs.length + connectedLocations.length + connectedQuests.length}</span></h3>
                            <div class="entity-links-grid">
                                ${connectedNpcs.length > 0 ? `
                                    <div class="links-group links-npcs">
                                        <div class="links-group-label"><i class="icon icon-npcs"></i> Connected NPCs</div>
                                        <div class="entity-links-list">
                                            ${connectedNpcs.map(n => `<span class="entity-link" data-type="npcs" data-id="${n.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(n.name)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${connectedLocations.length > 0 ? `
                                    <div class="links-group links-locations">
                                        <div class="links-group-label"><i class="icon icon-locations"></i> Connected Locations</div>
                                        <div class="entity-links-list">
                                            ${connectedLocations.map(l => `<span class="entity-link" data-type="locations" data-id="${l.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(l.name)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                ${connectedQuests.length > 0 ? `
                                    <div class="links-group links-quests">
                                        <div class="links-group-label"><i class="icon icon-quests"></i> Connected Quests</div>
                                        <div class="entity-links-list">
                                            ${connectedQuests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    ${this.renderReferencedBy(linked, shownIds)}
                </div>
            </div>
        `;
    },

    renderFactionDetail(entity, linked) {
        // Get connected entities
        const keyNpcs = (entity.keyNpcIds || entity.keyNPCs || []).map(id => DataManager.getEntity('npcs', id)).filter(Boolean);
        const locations = (entity.locationIds || []).map(id => DataManager.getEntity('locations', id)).filter(Boolean);
        const quests = (entity.questIds || entity.quests || []).map(id => DataManager.getEntity('quests', id)).filter(Boolean);

        const shownIds = new Set([
            ...keyNpcs.map(e => e.id),
            ...locations.map(e => e.id),
            ...quests.map(e => e.id)
        ]);

        const hasConnections = keyNpcs.length > 0 || locations.length > 0 || quests.length > 0;

        // Get reputation data
        const currentRep = entity.currentReputation ?? entity.reputationTrack?.current ?? 0;
        const repTrack = entity.reputationTrack;

        return `
            <div class="entity-detail-main">
                <div class="entity-detail-header">
                    <h2>${Utils.escapeHtml(entity.name)}</h2>
                    ${entity.headquarters || entity.leader ? `
                        <div class="entity-detail-subtitle">
                            ${entity.headquarters ? Utils.escapeHtml(entity.headquarters) : ''}
                            ${entity.leader ? (entity.headquarters ? ' • ' : '') + 'Leader: ' + Utils.escapeHtml(entity.leader) : ''}
                        </div>
                    ` : ''}
                </div>

                ${entity.description ? `<div class="entity-detail-section"><h3>Description</h3><div class="md-content">${Utils.parseMarkdown(entity.description)}</div></div>` : ''}

                ${repTrack ? `
                    <div class="entity-detail-section reputation-tracker">
                        <h3>Party Reputation: ${currentRep >= 0 ? '+' : ''}${currentRep}</h3>
                        <div class="reputation-bar">
                            <div class="reputation-fill" style="width: ${Math.min(100, Math.max(0, ((currentRep + 10) / 25) * 100))}%;"></div>
                            <div class="reputation-current" style="left: ${Math.min(100, Math.max(0, ((currentRep + 10) / 25) * 100))}%;"></div>
                        </div>
                        <div class="reputation-levels">
                            ${Object.entries(repTrack.levels || {}).map(([range, data]) => {
                                const match = range.match(/(-?\d+)\s+to\s+(-?\d+|\+)/);
                                const isActive = match && currentRep >= parseInt(match[1]) && (match[2] === '+' || currentRep <= parseInt(match[2]));
                                return `
                                    <div class="reputation-level ${isActive ? 'active' : ''}">
                                        <div class="reputation-level-header">
                                            <span class="reputation-level-range">${Utils.escapeHtml(range)}</span>
                                            <span class="reputation-level-rank">${Utils.escapeHtml(data.rank)}</span>
                                        </div>
                                        <div class="reputation-level-effects">${Utils.escapeHtml(data.effects)}</div>
                                        ${data.access ? `<div class="reputation-level-access"><strong>Access:</strong> ${Utils.escapeHtml(data.access)}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ${repTrack.reputationGains || repTrack.reputationLosses ? `
                            <div class="reputation-changes">
                                ${repTrack.reputationGains ? `
                                    <details class="dm-collapsible">
                                        <summary>Reputation Gains</summary>
                                        <div class="dm-content">
                                            ${Object.entries(repTrack.reputationGains).map(([action, value]) =>
                                                `<div>${Utils.escapeHtml(action)}: <strong>+${value}</strong></div>`
                                            ).join('')}
                                        </div>
                                    </details>
                                ` : ''}
                                ${repTrack.reputationLosses ? `
                                    <details class="dm-collapsible">
                                        <summary>Reputation Losses</summary>
                                        <div class="dm-content">
                                            ${Object.entries(repTrack.reputationLosses).map(([action, value]) =>
                                                `<div>${Utils.escapeHtml(action)}: <strong>${value}</strong></div>`
                                            ).join('')}
                                        </div>
                                    </details>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${entity.goals ? `<div class="entity-detail-section"><h3>Goals</h3><div class="md-content">${Utils.parseMarkdown(entity.goals)}</div></div>` : ''}
                ${entity.allies ? `<div class="entity-detail-section"><h3>Allies</h3><div class="md-content">${Utils.parseMarkdown(entity.allies)}</div></div>` : ''}
                ${entity.enemies ? `<div class="entity-detail-section"><h3>Enemies</h3><div class="md-content">${Utils.parseMarkdown(entity.enemies)}</div></div>` : ''}
                ${entity.resources ? `<div class="entity-detail-section"><h3>Resources</h3><div class="md-content">${Utils.parseMarkdown(entity.resources)}</div></div>` : ''}
                ${entity.loreReference ? `<div class="entity-detail-section"><h3>Lore Reference</h3><div class="md-content">${Utils.parseMarkdown(entity.loreReference)}</div></div>` : ''}
                ${entity.notes ? `<div class="entity-detail-section"><h3>Notes</h3><div class="md-content">${Utils.parseMarkdown(entity.notes)}</div></div>` : ''}

                ${entity.secrets ? `
                    <div class="entity-detail-section entity-detail-secret">
                        <h3><i class="icon icon-warning"></i> Secrets (DM Only)</h3>
                        <div class="md-content">${Utils.parseMarkdown(entity.secrets)}</div>
                    </div>
                ` : ''}

                ${hasConnections ? `
                    <div class="entity-detail-section">
                        <h3 class="connections-header"><i class="icon icon-link"></i> Connections <span class="connections-count">${keyNpcs.length + locations.length + quests.length}</span></h3>
                        <div class="entity-links-grid">
                            ${keyNpcs.length > 0 ? `
                                <div class="links-group links-npcs">
                                    <div class="links-group-label"><i class="icon icon-npcs"></i> Key NPCs</div>
                                    <div class="entity-links-list">
                                        ${keyNpcs.map(n => `<span class="entity-link" data-type="npcs" data-id="${n.id}"><i class="icon icon-npc"></i> ${Utils.escapeHtml(n.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${locations.length > 0 ? `
                                <div class="links-group links-locations">
                                    <div class="links-group-label"><i class="icon icon-locations"></i> Locations</div>
                                    <div class="entity-links-list">
                                        ${locations.map(l => `<span class="entity-link" data-type="locations" data-id="${l.id}"><i class="icon icon-location"></i> ${Utils.escapeHtml(l.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${quests.length > 0 ? `
                                <div class="links-group links-quests">
                                    <div class="links-group-label"><i class="icon icon-quests"></i> Related Quests</div>
                                    <div class="entity-links-list">
                                        ${quests.map(q => `<span class="entity-link" data-type="quests" data-id="${q.id}"><i class="icon icon-quest"></i> ${Utils.escapeHtml(q.name)}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${this.renderReferencedBy(linked, shownIds)}
            </div>
        `;
    },

    // Helper function to render "Referenced By" section (entities that link TO this one)
    renderReferencedBy(linked, shownIds) {
        const sections = [];
        const types = ['npcs', 'locations', 'shops', 'quests', 'items', 'lore'];
        let totalCount = 0;

        types.forEach(type => {
            const entities = linked[type];
            if (!entities || entities.length === 0) return;

            // Filter out already-shown entities
            const unshown = entities.filter(e => !shownIds.has(e.id));
            if (unshown.length === 0) return;

            totalCount += unshown.length;
            const singularType = type.replace(/s$/, '');

            sections.push(`
                <div class="links-group links-${type}">
                    <div class="links-group-label"><i class="icon icon-${type}"></i> ${Utils.getEntityTypeName(type)}</div>
                    <div class="entity-links-list">
                        ${unshown.map(e => `<span class="entity-link" data-type="${type}" data-id="${e.id}"><i class="icon icon-${singularType}"></i> ${Utils.escapeHtml(e.name || e.title)}</span>`).join('')}
                    </div>
                </div>
            `);
        });

        if (sections.length === 0) return '';

        return `
            <div class="entity-detail-section entity-detail-referenced-by">
                <h3>Referenced By <span class="connections-count">${totalCount}</span></h3>
                <div class="entity-links-grid">
                    ${sections.join('')}
                </div>
            </div>
        `;
    },

    // Open entity form for create/edit
    openEntityForm(type, id = null) {
        const config = this.formConfigs[type];
        const entity = id ? DataManager.getEntity(type, id) : {};
        const isEdit = !!id;

        const content = document.createElement('div');
        content.innerHTML = this.buildFormHtml(config, entity);

        // Setup link selectors
        this.setupFormLinkSelectors(content, config, entity);

        // Setup objectives for quests
        if (type === 'quests') {
            this.setupObjectivesEditor(content, entity.objectives || []);
        }

        const footer = document.createElement('div');
        footer.innerHTML = `
            <button class="btn" id="cancelForm">Cancel</button>
            <button class="btn btn-primary" id="saveForm">${isEdit ? 'Save Changes' : 'Create'}</button>
        `;

        UI.openModal({
            title: `${isEdit ? 'Edit' : 'New'} ${config.title}`,
            content,
            footer,
            size: 'large'
        });

        footer.querySelector('#cancelForm').addEventListener('click', () => UI.closeModal());
        footer.querySelector('#saveForm').addEventListener('click', () => {
            const formData = this.collectFormData(content, config, type);

            if (!formData) return; // Validation failed

            if (isEdit) {
                DataManager.updateEntity(type, id, formData);
                UI.showToast(`${config.title} updated`, 'success');
            } else {
                DataManager.createEntity(type, formData);
                UI.showToast(`${config.title} created`, 'success');
            }

            UI.closeModal();
            this.renderEntityList(type);
        });
    },

    buildFormHtml(config, entity) {
        let html = '';
        let currentGroup = null;

        config.fields.forEach(field => {
            // Handle field groups
            if (field.group && field.group !== currentGroup) {
                if (currentGroup) html += '</div>';
                html += `<div class="form-row">`;
                currentGroup = field.group;
            } else if (!field.group && currentGroup) {
                html += '</div>';
                currentGroup = null;
            }

            let value = entity[field.name] || '';

            // Convert arrays to newline-separated strings for display
            if (field.name === 'tags' || field.name === 'dialogueExamples') {
                if (Array.isArray(value)) {
                    value = value.join('\n');
                }
            }
            // Convert boxedText object to JSON string for editing
            else if (field.name === 'boxedText') {
                if (value && typeof value === 'object') {
                    value = JSON.stringify(value, null, 2);
                }
            }

            const wrapperClass = field.group ? 'form-group' : 'form-group';

            html += `<div class="${wrapperClass}">`;
            html += `<label for="field-${field.name}">${field.label}${field.required ? ' *' : ''}</label>`;

            switch (field.type) {
                case 'text':
                case 'url':
                case 'number':
                    html += `<input type="${field.type}" id="field-${field.name}" name="${field.name}" value="${Utils.escapeHtml(String(value))}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${field.required ? 'required' : ''}>`;
                    break;

                case 'textarea':
                    html += `<textarea id="field-${field.name}" name="${field.name}" rows="${field.rows || 3}" ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>${Utils.escapeHtml(String(value))}</textarea>`;
                    break;

                case 'select':
                    html += `<select id="field-${field.name}" name="${field.name}">`;
                    html += `<option value="">Select...</option>`;
                    field.options.forEach(opt => {
                        const optValue = typeof opt === 'string' ? opt : opt.value;
                        const optLabel = typeof opt === 'string' ? opt : opt.label;
                        html += `<option value="${optValue}" ${value === optValue ? 'selected' : ''}>${optLabel}</option>`;
                    });
                    html += `</select>`;
                    break;

                case 'checkbox':
                    html += `<div class="checkbox-group"><input type="checkbox" id="field-${field.name}" name="${field.name}" ${value ? 'checked' : ''}><span>Yes</span></div>`;
                    break;

                case 'link':
                case 'links':
                    html += `<div id="linkSelector-${field.name}" data-link-type="${field.linkType}" data-multiple="${field.type === 'links'}"></div>`;
                    break;

                case 'objectives':
                    html += `<div id="objectives-editor"></div>`;
                    break;
            }

            html += '</div>';
        });

        if (currentGroup) html += '</div>';

        return html;
    },

    setupFormLinkSelectors(container, config, entity) {
        config.fields.filter(f => f.type === 'link' || f.type === 'links').forEach(field => {
            const selectorContainer = container.querySelector(`#linkSelector-${field.name}`);
            if (!selectorContainer) return;

            const multiple = field.type === 'links';
            let selectedIds = entity[field.name] || [];
            if (!Array.isArray(selectedIds)) {
                selectedIds = selectedIds ? [selectedIds] : [];
            }

            const selector = UI.createLinkSelector(field.linkType, selectedIds, {
                multiple,
                excludeId: entity.id
            });

            selectorContainer.appendChild(selector);
            selectorContainer._selector = selector;
        });
    },

    setupObjectivesEditor(container, objectives) {
        const editor = container.querySelector('#objectives-editor');
        if (!editor) return;

        const render = () => {
            editor.innerHTML = `
                <div class="objectives-list">
                    ${objectives.map((obj, i) => `
                        <div class="objective-item">
                            <input type="checkbox" ${obj.completed ? 'checked' : ''} data-index="${i}">
                            <input type="text" value="${Utils.escapeHtml(obj.text)}" class="objective-text-input" data-index="${i}" style="flex:1;">
                            <button class="btn btn-small btn-ghost remove-objective" data-index="${i}">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-small" id="addObjective">+ Add Objective</button>
            `;

            editor.querySelector('#addObjective').addEventListener('click', () => {
                objectives.push({ text: '', completed: false });
                render();
            });

            editor.querySelectorAll('.objective-text-input').forEach(input => {
                input.addEventListener('change', () => {
                    objectives[input.dataset.index].text = input.value;
                });
            });

            editor.querySelectorAll('.objective-item input[type="checkbox"]').forEach(cb => {
                cb.addEventListener('change', () => {
                    objectives[cb.dataset.index].completed = cb.checked;
                });
            });

            editor.querySelectorAll('.remove-objective').forEach(btn => {
                btn.addEventListener('click', () => {
                    objectives.splice(parseInt(btn.dataset.index), 1);
                    render();
                });
            });
        };

        editor._objectives = objectives;
        render();
    },

    collectFormData(container, config, type) {
        const data = {};
        let valid = true;

        config.fields.forEach(field => {
            if (field.type === 'link' || field.type === 'links') {
                const selectorContainer = container.querySelector(`#linkSelector-${field.name}`);
                if (selectorContainer && selectorContainer._selector) {
                    const ids = selectorContainer._selector.getSelectedIds();
                    data[field.name] = field.type === 'links' ? ids : (ids[0] || null);
                }
            } else if (field.type === 'objectives') {
                const editor = container.querySelector('#objectives-editor');
                data.objectives = editor._objectives.filter(o => o.text.trim());
            } else if (field.type === 'checkbox') {
                data[field.name] = container.querySelector(`#field-${field.name}`).checked;
            } else {
                const input = container.querySelector(`#field-${field.name}`);
                if (input) {
                    let value = input.value.trim();
                    if (field.type === 'number' && value) {
                        value = parseFloat(value);
                    }

                    // Special handling for array fields (tags, dialogueExamples)
                    if (field.name === 'tags' || field.name === 'dialogueExamples') {
                        if (value) {
                            // Split by newlines or commas, trim, and filter empty
                            data[field.name] = value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
                        } else {
                            data[field.name] = [];
                        }
                    }
                    // Special handling for boxedText (JSON object)
                    else if (field.name === 'boxedText') {
                        if (value) {
                            try {
                                data[field.name] = JSON.parse(value);
                            } catch (e) {
                                UI.showToast('Boxed Text must be valid JSON', 'error');
                                input.style.borderColor = 'var(--danger)';
                                valid = false;
                            }
                        } else {
                            data[field.name] = null;
                        }
                    }
                    else {
                        data[field.name] = value;
                    }

                    if (field.required && !value) {
                        input.style.borderColor = 'var(--danger)';
                        valid = false;
                    }
                }
            }
        });

        if (!valid) {
            UI.showToast('Please fill in required fields', 'error');
            return null;
        }

        return data;
    },

    // Delete entity
    deleteEntity(type, id) {
        const entity = DataManager.getEntity(type, id);
        if (!entity) return;

        UI.confirm(`Delete "${entity.name || entity.title}"? This cannot be undone.`, () => {
            DataManager.deleteEntity(type, id);
            UI.showToast(`${this.formConfigs[type].title} deleted`, 'warning');
            UI.closeModal();
            this.renderEntityList(type);
        });
    }
};