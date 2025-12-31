// DM Screen - Tools Module

const Tools = {
    init() {
        this.setupDiceRoller();
        this.setupInitiativeTracker();
        this.setupRandomGenerators();
        this.setupQuickReference();
    },

    // Dice Roller
    setupDiceRoller() {
        // Standard dice buttons
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const dice = btn.dataset.dice;
                const sides = parseInt(dice.substring(1));
                this.rollDice(1, sides);
            });
        });

        // Custom dice input
        document.getElementById('rollCustomDice')?.addEventListener('click', () => {
            const input = document.getElementById('customDice');
            if (input && input.value.trim()) {
                this.rollCustomDice(input.value.trim());
            }
        });

        document.getElementById('customDice')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.rollCustomDice(e.target.value.trim());
            }
        });

        this.updateDiceHistory();
    },

    rollDice(count, sides, modifier = 0) {
        const rolls = Utils.rollDice(count, sides);
        const sum = rolls.reduce((a, b) => a + b, 0);
        const total = sum + modifier;

        const result = {
            notation: `${count}d${sides}${modifier ? (modifier > 0 ? '+' : '') + modifier : ''}`,
            rolls,
            sum,
            modifier,
            total
        };

        this.displayDiceResult(result);
        DataManager.addDiceRoll(result);
        this.updateDiceHistory();
    },

    rollCustomDice(notation) {
        const result = Utils.rollFromNotation(notation);
        if (!result) {
            UI.showToast('Invalid dice notation. Use format like "2d6+3"', 'error');
            return;
        }

        this.displayDiceResult(result);
        DataManager.addDiceRoll(result);
        this.updateDiceHistory();
    },

    displayDiceResult(result) {
        const resultEl = document.getElementById('diceResult');
        if (!resultEl) return;

        resultEl.innerHTML = `
            <div class="dice-result-total">${result.total}</div>
            <div class="dice-result-breakdown">
                ${result.notation}: [${result.rolls.join(', ')}]${result.modifier ? ` ${result.modifier > 0 ? '+' : ''}${result.modifier}` : ''}
            </div>
        `;

        // Animate
        resultEl.style.animation = 'none';
        resultEl.offsetHeight; // Trigger reflow
        resultEl.style.animation = 'pulse 0.3s ease';
    },

    updateDiceHistory() {
        const historyEl = document.getElementById('diceHistory');
        if (!historyEl) return;

        const history = DataManager.data.diceHistory || [];

        historyEl.innerHTML = history.slice(0, 10).map(roll => `
            <div class="dice-history-item">
                ${roll.notation} = ${roll.total} [${roll.rolls.join(', ')}]
            </div>
        `).join('');
    },

    // Initiative Tracker
    setupInitiativeTracker() {
        document.getElementById('addCombatant')?.addEventListener('click', () => this.openCombatantForm());
        document.getElementById('clearInitiative')?.addEventListener('click', () => this.clearInitiative());
        document.getElementById('nextTurn')?.addEventListener('click', () => this.nextTurn());
        document.getElementById('prevTurn')?.addEventListener('click', () => this.prevTurn());

        this.renderInitiativeList();
    },

    openCombatantForm(existingCombatant = null) {
        const isEdit = !!existingCombatant;
        const combatant = existingCombatant || {};

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="form-group">
                <label>Name *</label>
                <input type="text" id="combatantName" value="${Utils.escapeHtml(combatant.name || '')}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Initiative</label>
                    <input type="number" id="combatantInit" value="${combatant.initiative || ''}">
                </div>
                <div class="form-group">
                    <label>Roll d20 + modifier</label>
                    <div style="display:flex;gap:var(--spacing-sm);align-items:center;">
                        <button class="btn" id="rollInit">Roll</button>
                        <span>+</span>
                        <input type="number" id="initModifier" value="0" style="width:60px;">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Current HP</label>
                    <input type="number" id="combatantHp" value="${combatant.hp || ''}">
                </div>
                <div class="form-group">
                    <label>Max HP</label>
                    <input type="number" id="combatantMaxHp" value="${combatant.maxHp || ''}">
                </div>
                <div class="form-group">
                    <label>AC</label>
                    <input type="number" id="combatantAc" value="${combatant.ac || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Conditions</label>
                <div class="conditions-grid" style="display:flex;flex-wrap:wrap;gap:var(--spacing-xs);">
                    ${Object.keys(Utils.conditions).map(c => `
                        <label class="checkbox-group" style="margin-right:var(--spacing-md);">
                            <input type="checkbox" name="condition" value="${c}" ${(combatant.conditions || []).includes(c) ? 'checked' : ''}>
                            <span style="font-size:0.85rem;">${c}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <input type="text" id="combatantNotes" value="${Utils.escapeHtml(combatant.notes || '')}">
            </div>
            <div class="form-group">
                <label>Link to NPC (Optional)</label>
                <div id="combatantNpcLink"></div>
            </div>
        `;

        // NPC link selector
        const npcSelector = UI.createLinkSelector('npcs', combatant.npcId ? [combatant.npcId] : [], { multiple: false });
        content.querySelector('#combatantNpcLink').appendChild(npcSelector);

        // Roll initiative button
        content.querySelector('#rollInit').addEventListener('click', () => {
            const mod = parseInt(content.querySelector('#initModifier').value) || 0;
            const roll = Utils.rollDice(1, 20)[0];
            content.querySelector('#combatantInit').value = roll + mod;
            UI.showToast(`Rolled ${roll} + ${mod} = ${roll + mod}`, 'info');
        });

        const footer = document.createElement('div');
        footer.innerHTML = `
            ${isEdit ? '<button class="btn btn-danger" id="removeCombatant">Remove</button>' : ''}
            <button class="btn" id="cancelCombatant">Cancel</button>
            <button class="btn btn-primary" id="saveCombatant">${isEdit ? 'Save' : 'Add'}</button>
        `;

        UI.openModal({
            title: isEdit ? 'Edit Combatant' : 'Add Combatant',
            content,
            footer
        });

        footer.querySelector('#cancelCombatant').addEventListener('click', () => UI.closeModal());

        if (isEdit) {
            footer.querySelector('#removeCombatant').addEventListener('click', () => {
                this.removeCombatant(combatant.id);
                UI.closeModal();
            });
        }

        footer.querySelector('#saveCombatant').addEventListener('click', () => {
            const name = content.querySelector('#combatantName').value.trim();
            if (!name) {
                UI.showToast('Please enter a name', 'error');
                return;
            }

            const conditions = Array.from(content.querySelectorAll('input[name="condition"]:checked')).map(cb => cb.value);

            const data = {
                id: combatant.id || DataManager.generateId(),
                name,
                initiative: parseInt(content.querySelector('#combatantInit').value) || 0,
                hp: parseInt(content.querySelector('#combatantHp').value) || null,
                maxHp: parseInt(content.querySelector('#combatantMaxHp').value) || null,
                ac: parseInt(content.querySelector('#combatantAc').value) || null,
                conditions,
                notes: content.querySelector('#combatantNotes').value.trim(),
                npcId: npcSelector.getSelectedIds()[0] || null
            };

            const initiative = DataManager.data.initiative;

            if (isEdit) {
                const idx = initiative.combatants.findIndex(c => c.id === combatant.id);
                if (idx !== -1) initiative.combatants[idx] = data;
            } else {
                initiative.combatants.push(data);
            }

            // Sort by initiative
            initiative.combatants.sort((a, b) => b.initiative - a.initiative);

            DataManager.updateInitiative(initiative);
            UI.closeModal();
            this.renderInitiativeList();
        });
    },

    removeCombatant(id) {
        const initiative = DataManager.data.initiative;
        initiative.combatants = initiative.combatants.filter(c => c.id !== id);
        DataManager.updateInitiative(initiative);
        this.renderInitiativeList();
    },

    clearInitiative() {
        UI.confirm('Clear all combatants?', () => {
            DataManager.updateInitiative({
                combatants: [],
                currentIndex: 0,
                round: 1
            });
            this.renderInitiativeList();
        });
    },

    nextTurn() {
        const initiative = DataManager.data.initiative;
        if (initiative.combatants.length === 0) return;

        initiative.currentIndex++;
        if (initiative.currentIndex >= initiative.combatants.length) {
            initiative.currentIndex = 0;
            initiative.round++;
        }

        DataManager.updateInitiative(initiative);
        this.renderInitiativeList();
    },

    prevTurn() {
        const initiative = DataManager.data.initiative;
        if (initiative.combatants.length === 0) return;

        initiative.currentIndex--;
        if (initiative.currentIndex < 0) {
            initiative.currentIndex = initiative.combatants.length - 1;
            initiative.round = Math.max(1, initiative.round - 1);
        }

        DataManager.updateInitiative(initiative);
        this.renderInitiativeList();
    },

    renderInitiativeList() {
        const list = document.getElementById('initiativeList');
        const roundEl = document.getElementById('roundCount');
        if (!list) return;

        const initiative = DataManager.data.initiative;

        if (roundEl) roundEl.textContent = initiative.round;

        if (initiative.combatants.length === 0) {
            list.innerHTML = '<div class="text-muted" style="text-align:center;padding:var(--spacing-lg);">No combatants</div>';
            return;
        }

        list.innerHTML = initiative.combatants.map((c, i) => `
            <div class="initiative-item ${i === initiative.currentIndex ? 'active' : ''} ${c.hp !== null && c.hp <= 0 ? 'dead' : ''}" data-id="${c.id}">
                <span class="initiative-order">${c.initiative}</span>
                <span class="initiative-name">${Utils.escapeHtml(c.name)}</span>
                ${c.ac ? `<span class="text-muted" style="font-size:0.8rem;">AC ${c.ac}</span>` : ''}
                ${c.hp !== null ? `
                    <div class="initiative-hp">
                        <input type="number" value="${c.hp}" data-field="hp" style="width:50px;text-align:center;">
                        ${c.maxHp ? `<span class="text-muted">/ ${c.maxHp}</span>` : ''}
                    </div>
                ` : ''}
                ${c.conditions && c.conditions.length > 0 ? `
                    <div class="initiative-conditions">
                        ${c.conditions.map(cond => `<span class="initiative-condition" title="${cond}">${cond.substring(0, 3)}</span>`).join('')}
                    </div>
                ` : ''}
                <span class="initiative-remove" title="Edit">✏</span>
            </div>
        `).join('');

        // HP input handlers
        list.querySelectorAll('.initiative-hp input').forEach(input => {
            input.addEventListener('change', (e) => {
                const item = e.target.closest('.initiative-item');
                const combatant = initiative.combatants.find(c => c.id === item.dataset.id);
                if (combatant) {
                    combatant.hp = parseInt(e.target.value) || 0;
                    DataManager.updateInitiative(initiative);
                    this.renderInitiativeList();
                }
            });

            input.addEventListener('click', (e) => e.stopPropagation());
        });

        // Edit handler
        list.querySelectorAll('.initiative-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.target.closest('.initiative-item');
                const combatant = initiative.combatants.find(c => c.id === item.dataset.id);
                if (combatant) this.openCombatantForm(combatant);
            });
        });
    },

    // Random Generators
    setupRandomGenerators() {
        document.getElementById('generateName')?.addEventListener('click', () => {
            const race = document.getElementById('nameRace').value;
            const gender = document.getElementById('nameGender').value;
            const name = Utils.generateName(race, gender);
            document.getElementById('nameResult').textContent = name;
        });

        document.getElementById('generateEncounter')?.addEventListener('click', () => {
            const difficulty = document.getElementById('encounterDifficulty').value;
            const encounter = Utils.generateEncounter(difficulty);
            document.getElementById('encounterResult').textContent = encounter;
        });
    },

    // Quick Reference
    setupQuickReference() {
        // Conditions
        const conditionsEl = document.getElementById('refConditions');
        if (conditionsEl) {
            conditionsEl.innerHTML = Object.entries(Utils.conditions).map(([name, desc]) =>
                `<p><strong>${name}:</strong> ${desc}</p>`
            ).join('');
        }

        // Actions
        const actionsEl = document.getElementById('refActions');
        if (actionsEl) {
            actionsEl.innerHTML = Object.entries(Utils.actions).map(([name, desc]) =>
                `<p><strong>${name}:</strong> ${desc}</p>`
            ).join('');
        }

        // Cover
        const coverEl = document.getElementById('refCover');
        if (coverEl) {
            coverEl.innerHTML = Object.entries(Utils.coverRules).map(([name, desc]) =>
                `<p><strong>${name}:</strong> ${desc}</p>`
            ).join('');
        }

        // Light
        const lightEl = document.getElementById('refLight');
        if (lightEl) {
            lightEl.innerHTML = Object.entries(Utils.lightRules).map(([name, desc]) =>
                `<p><strong>${name}:</strong> ${desc}</p>`
            ).join('');
        }
    }
};

// Add CSS animation for dice result
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);