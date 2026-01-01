// Quest Graph Visualization Module
const QuestGraph = {
    network: null,
    data: null,
    isInitialized: false,

    init() {
        // Check if Vis.js library is loaded
        if (typeof vis === 'undefined') {
            console.error("Vis.js not loaded! Make sure the script tag is in index.html");
            return;
        }

        // Setup Event Listeners for the toggle buttons
        const listBtn = document.getElementById('questViewList');
        const graphBtn = document.getElementById('questViewGraph');
        const listContainer = document.getElementById('questList');
        const graphContainer = document.getElementById('questGraphContainer');

        if (listBtn && graphBtn) {
            listBtn.addEventListener('click', () => {
                listBtn.classList.add('active');
                graphBtn.classList.remove('active');
                listContainer.classList.remove('hidden');
                graphContainer.classList.add('hidden');
            });

            graphBtn.addEventListener('click', () => {
                graphBtn.classList.add('active');
                listBtn.classList.remove('active');
                listContainer.classList.add('hidden');
                graphContainer.classList.remove('hidden');

                // Render with a slight delay to ensure container is visible/sized correctly
                setTimeout(() => {
                    this.render();
                }, 100);
            });
        }

        // Graph controls
        document.getElementById('graphFit')?.addEventListener('click', () => {
            if (this.network) {
                this.network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
            }
        });

        document.getElementById('graphPhysics')?.addEventListener('click', () => {
            if (this.network) {
                this.network.stabilize(100);
                setTimeout(() => {
                    this.network.setOptions({ physics: { enabled: false } });
                    UI.showToast("Layout stabilized", "success");
                }, 500);
            }
        });

        this.isInitialized = true;
        console.log("QuestGraph initialized");
    },

    getQuestType(quest) {
        const type = quest.type || 'Other';
        if (type === 'Bounty') return 'Side';
        if (type === 'Errand') return 'Side';
        return type;
    },

    getStatusWeight(status) {
        // Active quests should be more prominent
        const weights = {
            'Active': 3,
            'Available': 2,
            'Not Started': 1,
            'On Hold': 1,
            'Completed': 0.5,
            'Failed': 0.5
        };
        return weights[status] || 1;
    },

    getOptions() {
        return {
            nodes: {
                shape: 'box',
                margin: { top: 10, bottom: 10, left: 15, right: 15 },
                borderWidth: 2,
                borderWidthSelected: 3,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.3)',
                    size: 8,
                    x: 2,
                    y: 2
                },
                font: {
                    face: 'Cinzel, Georgia, serif',
                    size: 13,
                    color: '#d4c4a8',
                    bold: {
                        color: '#d4c4a8',
                        size: 14
                    }
                },
                shapeProperties: {
                    borderRadius: 4
                }
            },
            edges: {
                arrows: {
                    to: {
                        enabled: true,
                        scaleFactor: 0.6,
                        type: 'arrow'
                    }
                },
                color: {
                    color: '#6b5a45',
                    highlight: '#8b7355',
                    hover: '#a08868',
                    opacity: 0.8
                },
                width: 2,
                smooth: {
                    enabled: true,
                    type: 'cubicBezier',
                    forceDirection: 'none',
                    roundness: 0.5
                },
                selectionWidth: 2
            },
            layout: {
                improvedLayout: true,
                hierarchical: false
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -80,
                    centralGravity: 0.008,
                    springLength: 180,
                    springConstant: 0.04,
                    damping: 0.5,
                    avoidOverlap: 0.5
                },
                stabilization: {
                    enabled: true,
                    iterations: 300,
                    updateInterval: 25,
                    fit: true
                },
                minVelocity: 0.75
            },
            interaction: {
                hover: true,
                hoverConnectedEdges: true,
                tooltipDelay: 150,
                zoomView: true,
                dragView: true,
                dragNodes: true,
                multiselect: false,
                navigationButtons: false,
                keyboard: {
                    enabled: true,
                    bindToWindow: false
                }
            }
        };
    },

    // Color schemes for quest types and statuses
    getColorScheme() {
        return {
            types: {
                Main: {
                    bg: '#5c4a2a',
                    border: '#d4af37',
                    highlight: '#8b6b3a',
                    glow: 'rgba(212, 175, 55, 0.4)'
                },
                Side: {
                    bg: '#2a3d4d',
                    border: '#5c8ab4',
                    highlight: '#3a5a7b',
                    glow: 'rgba(92, 138, 180, 0.3)'
                },
                Personal: {
                    bg: '#3d2a4d',
                    border: '#9b6bb3',
                    highlight: '#6a4c93',
                    glow: 'rgba(155, 107, 179, 0.3)'
                },
                Faction: {
                    bg: '#2a4d2a',
                    border: '#5cb45c',
                    highlight: '#3a6b3a',
                    glow: 'rgba(92, 180, 92, 0.3)'
                },
                Other: {
                    bg: '#3d3425',
                    border: '#8b8070',
                    highlight: '#4d4435',
                    glow: 'rgba(139, 128, 112, 0.3)'
                }
            },
            statuses: {
                'Active': { opacity: 1.0, borderWidth: 3 },
                'Available': { opacity: 0.9, borderWidth: 2 },
                'Not Started': { opacity: 0.6, borderWidth: 1, bg: '#2a2318' },
                'On Hold': { opacity: 0.5, borderWidth: 1, dashed: true },
                'Completed': { opacity: 0.4, borderWidth: 1, bg: '#1a1510', border: '#444', font: '#666' },
                'Failed': { opacity: 0.3, borderWidth: 1, bg: '#2a1515', border: '#8b3a3a', font: '#666' }
            }
        };
    },

    render() {
        const container = document.getElementById('questNetwork');
        if (!container) {
            console.error("Quest network container not found");
            return;
        }

        // Ensure container has dimensions
        const rect = container.getBoundingClientRect();
        if (rect.height < 100) {
            container.style.minHeight = '500px';
        }

        // Get Data from DataManager
        const quests = DataManager.getAllEntities('quests');

        // HANDLE EMPTY STATE
        if (!quests || quests.length === 0) {
            container.innerHTML = `
                <div class="quest-graph-empty">
                    <div class="quest-graph-empty-icon"><i class="icon icon-quests"></i></div>
                    <h3>No Quests Yet</h3>
                    <p>Add quests to visualize your campaign's quest structure and dependencies.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('addQuestBtn')?.click()">
                        <i class="icon icon-plus"></i> Add First Quest
                    </button>
                </div>`;
            return;
        }

        // Clear previous network if it exists
        if (this.network) {
            this.network.destroy();
            this.network = null;
        }

        // Clear previous data
        if (this.data) {
            this.data = null;
        }

        // Clear container
        container.innerHTML = '';

        const nodes = [];
        const edges = [];
        const ids = new Set();
        const colors = this.getColorScheme();

        // First pass: collect all IDs and check for duplicates
        const seenIds = new Set();
        quests.forEach(q => {
            if (!seenIds.has(q.id)) {
                seenIds.add(q.id);
                ids.add(q.id);
            } else {
                console.warn(`Duplicate quest ID found: ${q.id}`);
            }
        });

        // Second pass: build nodes and edges (skip duplicates)
        const processedIds = new Set();
        quests.forEach(q => {
            // Skip if we already processed this ID
            if (processedIds.has(q.id)) {
                return;
            }
            processedIds.add(q.id);

            const type = this.getQuestType(q);
            const typeColors = colors.types[type] || colors.types.Other;
            const statusMods = colors.statuses[q.status] || colors.statuses['Not Started'];

            // Calculate node properties
            const bgColor = statusMods.bg || typeColors.bg;
            const borderColor = statusMods.border || typeColors.border;
            const fontColor = statusMods.font || '#d4c4a8';

            // Build label with status indicator
            let label = q.name;
            if (label.length > 25) {
                label = label.substring(0, 22) + '...';
            }

            // Status icon prefix
            const statusIcons = {
                'Active': '⚔ ',
                'Available': '◉ ',
                'Completed': '✓ ',
                'Failed': '✗ ',
                'On Hold': '⏸ '
            };
            const statusPrefix = statusIcons[q.status] || '';

            nodes.push({
                id: q.id,
                label: statusPrefix + label,
                title: this.buildTooltip(q),
                color: {
                    background: bgColor,
                    border: borderColor,
                    highlight: {
                        background: typeColors.highlight,
                        border: borderColor
                    },
                    hover: {
                        background: typeColors.highlight,
                        border: borderColor
                    }
                },
                font: {
                    color: fontColor,
                    size: q.status === 'Active' ? 14 : 13
                },
                borderWidth: statusMods.borderWidth || 2,
                opacity: statusMods.opacity || 1,
                shadow: {
                    enabled: q.status === 'Active' || q.status === 'Available',
                    color: typeColors.glow,
                    size: q.status === 'Active' ? 15 : 8
                },
                // Store quest data for click handler
                questData: q
            });

            // Build edges from prerequisites
            if (q.prerequisiteIds && q.prerequisiteIds.length > 0) {
                q.prerequisiteIds.forEach(prereqId => {
                    // Only add edge if both nodes exist
                    if (ids.has(prereqId)) {
                        edges.push({
                            from: prereqId,
                            to: q.id,
                            dashes: q.status === 'Not Started' || q.status === 'On Hold',
                            width: q.status === 'Active' ? 3 : 2,
                            color: {
                                opacity: q.status === 'Completed' || q.status === 'Failed' ? 0.3 : 0.7
                            }
                        });
                    }
                });
            }
        });

        // Create the network
        try {
            this.data = {
                nodes: new vis.DataSet(nodes),
                edges: new vis.DataSet(edges)
            };

            this.network = new vis.Network(container, this.data, this.getOptions());

            // Event handlers
            this.network.on("click", (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    Entities.viewEntity('quests', nodeId);
                }
            });

            this.network.on("hoverNode", () => {
                container.style.cursor = 'pointer';
            });

            this.network.on("blurNode", () => {
                container.style.cursor = 'default';
            });

            this.network.on("doubleClick", (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    Entities.editEntity('quests', nodeId);
                }
            });

            // Fit to view after stabilization
            this.network.on("stabilizationIterationsDone", () => {
                this.network.fit({
                    animation: {
                        duration: 500,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            });

            console.log(`Quest graph rendered: ${nodes.length} quests, ${edges.length} connections`);

        } catch (error) {
            console.error("Error rendering quest graph:", error);
            container.innerHTML = `
                <div class="quest-graph-empty">
                    <h3>Error Loading Graph</h3>
                    <p>${error.message}</p>
                </div>`;
        }
    },

    buildTooltip(quest) {
        const parts = [
            `<div class="graph-tooltip">`,
            `<strong>${Utils.escapeHtml(quest.name)}</strong>`,
            `<div class="tooltip-meta">${quest.type || 'Quest'} • ${quest.status || 'Unknown'}</div>`
        ];

        if (quest.description) {
            const desc = quest.description.length > 150
                ? quest.description.substring(0, 147) + '...'
                : quest.description;
            parts.push(`<div class="tooltip-desc">${Utils.escapeHtml(desc)}</div>`);
        }

        // Show quest giver if exists
        if (quest.giverNpcId) {
            const giver = DataManager.getEntity('npcs', quest.giverNpcId);
            if (giver) {
                parts.push(`<div class="tooltip-giver">Quest Giver: ${Utils.escapeHtml(giver.name)}</div>`);
            }
        }

        // Show objective count
        if (quest.objectives && quest.objectives.length > 0) {
            const completed = quest.objectives.filter(o => o.completed).length;
            parts.push(`<div class="tooltip-objectives">Objectives: ${completed}/${quest.objectives.length}</div>`);
        }

        parts.push(`<div class="tooltip-hint">Click to view • Double-click to edit</div>`);
        parts.push(`</div>`);

        return parts.join('');
    },

    // Refresh the graph (call after quest changes)
    refresh() {
        if (!document.getElementById('questGraphContainer')?.classList.contains('hidden')) {
            this.render();
        }
    },

    // Focus on a specific quest
    focusQuest(questId) {
        if (this.network && this.data.nodes.get(questId)) {
            this.network.focus(questId, {
                scale: 1.5,
                animation: {
                    duration: 500,
                    easingFunction: 'easeInOutQuad'
                }
            });
            this.network.selectNodes([questId]);
        }
    }
};