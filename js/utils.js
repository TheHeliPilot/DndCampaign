// DM Screen - Utility Functions

const Utils = {
    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Truncate text with ellipsis
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    // Format date for display
    formatDate(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Parse dice notation (e.g., "2d6+3")
    parseDiceNotation(notation) {
        const regex = /^(\d+)?d(\d+)([+-]\d+)?$/i;
        const match = notation.trim().match(regex);

        if (!match) return null;

        return {
            count: parseInt(match[1]) || 1,
            sides: parseInt(match[2]),
            modifier: parseInt(match[3]) || 0
        };
    },

    // Roll dice
    rollDice(count, sides) {
        const rolls = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }
        return rolls;
    },

    // Roll dice from notation
    rollFromNotation(notation) {
        const parsed = this.parseDiceNotation(notation);
        if (!parsed) return null;

        const rolls = this.rollDice(parsed.count, parsed.sides);
        const sum = rolls.reduce((a, b) => a + b, 0);
        const total = sum + parsed.modifier;

        return {
            notation,
            rolls,
            sum,
            modifier: parsed.modifier,
            total
        };
    },

    // Get entity type display name
    getEntityTypeName(type, singular = false) {
        const names = {
            npcs: singular ? 'NPC' : 'NPCs',
            locations: singular ? 'Location' : 'Locations',
            shops: singular ? 'Shop' : 'Shops',
            quests: singular ? 'Quest' : 'Quests',
            items: singular ? 'Item' : 'Items',
            lore: singular ? 'Lore Entry' : 'Lore',
            maps: singular ? 'Map' : 'Maps',
            pcs: singular ? 'Player Character' : 'Player Characters'
        };
        return names[type] || type;
    },

    // Get entity icon as HTML element
    getEntityIcon(type) {
        return `<i class="icon icon-${type}"></i>`;
    },

    // Get disposition tag class
    getDispositionClass(disposition) {
        const classes = {
            friendly: 'tag-friendly',
            neutral: 'tag-neutral',
            hostile: 'tag-hostile',
            unknown: 'tag-unknown'
        };
        return classes[disposition] || 'tag-unknown';
    },

    // Get quest status class
    getStatusClass(status) {
        const statusKey = status.toLowerCase().replace(/\s+/g, '-');
        return `status-${statusKey}`;
    },

    // Get rarity class
    getRarityClass(rarity) {
        const rarityKey = rarity.toLowerCase().replace(/\s+/g, '-');
        return `rarity-${rarityKey}`;
    },

    // Convert image file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Generate random fantasy names
    nameGenerators: {
        human: {
            male: [
                'Aldric', 'Bram', 'Cedric', 'Darian', 'Edmund', 'Finn', 'Gareth', 'Hugo', 'Ivan', 'Jasper',
                'Kelvin', 'Lionel', 'Marcus', 'Nolan', 'Oliver', 'Preston', 'Quinn', 'Roland', 'Sebastian',
                'Theron', 'Ulric', 'Victor', 'William', 'Xavier', 'Yorick', 'Zander',
                'Alaric', 'Benedict', 'Corwin', 'Desmond', 'Elliot', 'Frederick', 'Gregory', 'Henry',
                'Isaac', 'Julian', 'Leonard', 'Maxwell', 'Percival', 'Reginald', 'Theodore', 'Vincent'
            ],
            female: [
                'Adeline', 'Beatrice', 'Clara', 'Diana', 'Eleanor', 'Fiona', 'Gwendolyn', 'Helena', 'Iris',
                'Josephine', 'Katherine', 'Lillian', 'Margaret', 'Natalie', 'Ophelia', 'Penelope', 'Quinn',
                'Rosalind', 'Sophia', 'Theodora', 'Una', 'Victoria', 'Wilhelmina', 'Xena', 'Yvonne', 'Zelda',
                'Amelia', 'Bridget', 'Cecilia', 'Dorothea', 'Eliza', 'Florence', 'Georgina', 'Isolde',
                'Lucinda', 'Matilda', 'Prudence', 'Rebecca', 'Tabitha', 'Winifred'
            ],
            surnames: [
                'Ashford', 'Blackwood', 'Crane', 'Darkholme', 'Everhart', 'Fairfax', 'Goldwyn', 'Hawthorne',
                'Ironside', 'Jasper', 'Kingsley', 'Lancaster', 'Montague', 'Northwood', 'Oakenshield',
                'Pemberton', 'Queensbury', 'Ravenscroft', 'Sterling', 'Thornwood', 'Underhill', 'Valentine',
                'Westbrook', 'Yarwood', 'Zimmer',
                'Brightwater', 'Coldstream', 'Dunwell', 'Eastmarch', 'Grimshaw', 'Highmore', 'Lockwood',
                'Redwyne', 'Stormhaven', 'Whitlock'
            ]
        },

        elf: {
            male: [
                'Aelindor', 'Caelum', 'Faenor', 'Galathil', 'Ithildin', 'Legolias', 'Miravel', 'Nelaeryn',
                'Orophin', 'Pharanol', 'Quelindor', 'Raelarion', 'Silvarion', 'Thalion', 'Valandil',
                'Aerendyl', 'Calenor', 'Erevan', 'Faelar', 'Laucian', 'Mythrandir', 'Soveliss'
            ],
            female: [
                'Aelindra', 'Celebrian', 'Elanor', 'Galadriel', 'Idril', 'Luthien', 'Miriel', 'Nerdanel',
                'Oriel', 'Silmarien', 'Tindome', 'Vanyarie', 'Yavanna',
                'Aerisyl', 'Caelynn', 'Eilistraee', 'Felosial', 'Keyleth', 'Naivara'
            ],
            surnames: [
                'Amastacia', 'Galanodel', 'Holimion', 'Ilphelkiir', 'Liadon', 'Meliamne', 'Nailo',
                'Siannodel', 'Xiloscient',
                'Moonwhisper', 'Starbreeze', 'Dawnsinger', 'Silverfrond'
            ]
        },

        dwarf: {
            male: [
                'Balin', 'Dain', 'Durin', 'Farin', 'Gimli', 'Kili', 'Nain', 'Oin', 'Thorin', 'Thrain',
                'Brom', 'Einkil', 'Harbek', 'Morgran', 'Orsik', 'Rurik', 'Taklinn'
            ],
            female: [
                'Amber', 'Bardryn', 'Diesa', 'Eldeth', 'Gunnloda', 'Helja', 'Kathra', 'Liftrasa',
                'Mardred', 'Riswynn', 'Torbera', 'Vistra',
                'Artin', 'Audhild', 'Dagnal', 'Falkrunn', 'Sannl'
            ],
            surnames: [
                'Balderk', 'Battlehammer', 'Brawnanvil', 'Dankil', 'Fireforge', 'Frostbeard', 'Gorunn',
                'Holderhek', 'Ironfist', 'Loderr', 'Lutgehr', 'Rumnaheim', 'Strakeln', 'Torunn', 'Ungart',
                'Deepdelver', 'Stonevein', 'Goldfinder'
            ]
        },

        halfling: {
            male: [
                'Alton', 'Cade', 'Eldon', 'Garrett', 'Lyle', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Roscoe',
                'Wellby', 'Bingo', 'Finnan', 'Merric', 'Tobias'
            ],
            female: [
                'Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian', 'Kithri', 'Lavinia', 'Lidda',
                'Merla', 'Nedda', 'Paela', 'Portia', 'Seraphina', 'Shaena', 'Trym', 'Vani', 'Verna',
                'Belba', 'Esmeralda', 'Rosie'
            ],
            surnames: [
                'Brushgather', 'Goodbarrel', 'Greenbottle', 'High-hill', 'Hilltopple', 'Leagallow',
                'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough',
                'Appleblossom', 'Quickfoot'
            ]
        },

        orc: {
            male: [
                'Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Kelh', 'Krusk', 'Mhurren', 'Ront',
                'Shump', 'Thokk', 'Brug', 'Dorn', 'Gnarsh'
            ],
            female: [
                'Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha',
                'Sutha', 'Vola', 'Volen', 'Yevelda', 'Grima', 'Urzula'
            ],
            surnames: [
                'Bonecrusher', 'Doomfist', 'Ironjaw', 'Skullsplitter', 'Warborn', 'Bloodfang',
                'Grimtooth', 'Redmaw'
            ]
        },

        tiefling: {
            male: [
                'Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis',
                'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai',
                'Azazel', 'Baal', 'Zerach'
            ],
            female: [
                'Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa',
                'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta',
                'Astarte', 'Lilith'
            ],
            surnames: [
                'Art', 'Carrion', 'Chant', 'Creed', 'Despair', 'Excellence', 'Fear', 'Glory', 'Hope',
                'Ideal', 'Music', 'Nowhere', 'Open', 'Poetry', 'Quest', 'Random', 'Reverence',
                'Sorrow', 'Torment', 'Weary', 'Ash', 'Dread'
            ]
        },

        dragonborn: {
            male: [
                'Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash',
                'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash', 'Shedinn',
                'Tarhun', 'Torinn', 'Vrak'
            ],
            female: [
                'Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava',
                'Korinn', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Sora', 'Surina',
                'Thava', 'Uadjit', 'Zofra'
            ],
            surnames: [
                'Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon',
                'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul', 'Linxakasendalor', 'Myastan',
                'Nemmonis', 'Norixius', 'Ophinshtalajiir', 'Prexijandilin',
                'Shestendeliath', 'Turnuroth', 'Verthisathurgiesh', 'Yarjerit'
            ]
        }
    },

    generateName(race, gender) {
        const raceData = this.nameGenerators[race];
        if (!raceData) return 'Unknown';

        let firstName;
        if (gender === 'any') {
            const genderChoice = Math.random() > 0.5 ? 'male' : 'female';
            firstName = raceData[genderChoice][Math.floor(Math.random() * raceData[genderChoice].length)];
        } else {
            firstName = raceData[gender][Math.floor(Math.random() * raceData[gender].length)];
        }

        const surname = raceData.surnames[Math.floor(Math.random() * raceData.surnames.length)];

        return `${firstName} ${surname}`;
    },

    // Random encounter tables
    encounterTables: {
        easy: [
            '1d4 Huntsmen',
            '2d4 Rabid Villagers',
            '1d6 Scourge Dogs',
            '1d4 Carrion Crows',
            '2d6 Corpse Rats',
            '1d4 Madmen',
            '1d6 Lost Children',
            '1d4 Sewer Leeches',
            '2d4 Pale Beggars',
            '1 Brute Servant',
            '1d4 Plague Victims',
            '2d4 Blood Drunk Hunters (Wounded)',
            '1d6 Grave Crawlers',
            '1d4 Chapel Thralls',
            '2d6 Starved Ghouls',
            '1d4 Lamprey Thralls',
            '1d6 Diseased Wolves',
            '2d4 Cemetery Shades',
            '1d4 Church Fanatics',
            '1 Wandering Mad Scholar'
        ],

        medium: [
            '2d4 Huntsmen with Firearms',
            '1d4 Blood Drunk Hunters',
            '1d6 Scourge Beasts',
            '2d4 Church Servants',
            '1d4 Kidnappers',
            '1d6 Snatcher Thralls',
            '2d6 Carrion Watchdogs',
            '1d4 Beast Patients',
            '1d4 Church Giants',
            '2d4 Mad Scholars',
            '1d6 Nightmare Apostles',
            '1d4 Loran Silverbeasts',
            '2d4 Shadowy Watchers',
            '1d4 Brute Servants',
            '1d6 Parasite Hosts',
            '2d4 Tomb Guardians',
            '1d4 Blood Saints',
            '1d6 Moon-Touched Villagers',
            '1d4 Bell-Ringing Women',
            '1 Lesser Amygdala Spawn'
        ],

        hard: [
            '1 Blood Starved Beast',
            '1d4 Kidnappers with Hounds',
            '2d4 Scourge Beasts',
            '1 Church Giant with Chains',
            '1d4 Nightmare Executioners',
            '1d6 Snatchers',
            '1d4 Loran Clerics',
            '2d4 Gravewardens',
            '1d4 Winter Lanterns',
            '1d6 Parasite Horrors',
            '1d4 Nightmare Hunters',
            '1 Chalice Dungeon Guardian',
            '1d4 Cainhurst Ghosts',
            '1d6 Insight Leeches',
            '1d4 Bloodlickers',
            '1d4 Moon Beasts',
            '1d6 Church Assassins',
            '1 Lesser Great One Servant',
            '1d4 Forgotten Kin',
            '1 Ritual Abomination'
        ],

        deadly: [
            '1 Amygdala',
            '1 Ebrietas, Daughter of the Cosmos',
            '1d4 Winter Lanterns',
            '1 Great One Avatar',
            '1 Orphan of Kos',
            '1 Moon Presence',
            '1d4 Nightmare Apostles (Empowered)',
            '1 Chalice Dungeon Great Guardian',
            '1d4 Blood Saints (Ascended)',
            '1 Star-Spawned Abomination',
            '1 Ancient Loran Silverbeast',
            '1d4 Cainhurst Nobles',
            '1 Cosmic Horror of the Deep',
            '1 Living Mass of Eyes',
            '1d4 Insight Devourers',
            '1d4 Church Giants (Blessed)',
            '1d4 Kin of the Cosmos',
            '1d4 Parasite Colossi',
            '1 Herald of the Great Ones',
            '1 Cataclysmic Eldritch Entity'
        ]
    },

    generateEncounter(difficulty) {
        const table = this.encounterTables[difficulty];
        if (!table) return 'Unknown encounter';
        return table[Math.floor(Math.random() * table.length)];
    },

    // D&D Reference Data
    conditions: {
        'Blinded': 'Cannot see. Auto-fail sight checks. Attack rolls against have advantage. Attacks have disadvantage.',
        'Charmed': 'Cannot attack charmer. Charmer has advantage on social checks.',
        'Deafened': 'Cannot hear. Auto-fail hearing checks.',
        'Frightened': 'Disadvantage on checks/attacks while source visible. Cannot move closer to source.',
        'Grappled': 'Speed becomes 0. Ends if grappler incapacitated or forced apart.',
        'Incapacitated': 'Cannot take actions or reactions.',
        'Invisible': 'Impossible to see without magic. Attacks against have disadvantage. Attacks have advantage.',
        'Paralyzed': 'Incapacitated, cannot move or speak. Auto-fail Str/Dex saves. Attacks have advantage. Hits within 5ft are crits.',
        'Petrified': 'Transformed to stone. Weight x10. Incapacitated, unaware. Attacks have advantage. Auto-fail Str/Dex saves. Resistant to all damage. Immune to poison/disease.',
        'Poisoned': 'Disadvantage on attack rolls and ability checks.',
        'Prone': 'Can only crawl. Disadvantage on attacks. Attacks within 5ft have advantage, beyond have disadvantage.',
        'Restrained': 'Speed 0, no bonuses. Attacks against have advantage. Attacks have disadvantage. Disadvantage on Dex saves.',
        'Stunned': 'Incapacitated, cannot move, can only speak falteringly. Auto-fail Str/Dex saves. Attacks against have advantage.',
        'Unconscious': 'Incapacitated, cannot move or speak, unaware. Drop everything, fall prone. Auto-fail Str/Dex saves. Attacks have advantage. Hits within 5ft are crits.'
    },

    actions: {
        'Attack': 'Make one melee or ranged attack.',
        'Cast a Spell': 'Cast a spell with casting time of 1 action.',
        'Dash': 'Gain extra movement equal to your speed.',
        'Disengage': 'Movement doesn\'t provoke opportunity attacks.',
        'Dodge': 'Attacks against you have disadvantage if you can see attacker. Advantage on Dex saves.',
        'Help': 'Give an ally advantage on next ability check or attack roll.',
        'Hide': 'Make Dexterity (Stealth) check to hide.',
        'Ready': 'Prepare an action to trigger later. Uses reaction when triggered.',
        'Search': 'Make Wisdom (Perception) or Intelligence (Investigation) check.',
        'Use an Object': 'Interact with a second object (first is free).'
    },

    coverRules: {
        'Half Cover': '+2 bonus to AC and Dexterity saving throws. Obstacle blocks at least half of target.',
        'Three-Quarters Cover': '+5 bonus to AC and Dexterity saving throws. About three-quarters of target blocked.',
        'Total Cover': 'Cannot be targeted directly by attack or spell. Completely concealed by obstacle.'
    },

    lightRules: {
        'Bright Light': 'Normal vision. Most creatures see normally.',
        'Dim Light': 'Lightly obscured. Disadvantage on Perception checks relying on sight.',
        'Darkness': 'Heavily obscured. Effectively blinded when trying to see something in darkness.',
        'Darkvision': 'See in dim light as if bright light (limited range). See in darkness as dim light (no color).',
        'Blindsight': 'Perceive surroundings without sight within specific radius.',
        'Truesight': 'See in normal and magical darkness, invisible creatures, illusions, shapechangers\' true form, into Ethereal Plane.'
    },

    // Parse markdown-like formatting to HTML
    parseMarkdown(text) {
        if (!text) return '';

        // First escape HTML
        let html = this.escapeHtml(text);

        // Headers (## Header)
        html = html.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
        html = html.replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>');
        html = html.replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>');

        // Bold (**text** or __text__)
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic (*text* or _text_)
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Bullet lists (- item or * item)
        html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="md-list">$&</ul>');

        // Numbered lists (1. item)
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Horizontal rules (--- or ***)
        html = html.replace(/^[-*]{3,}$/gm, '<hr class="md-hr">');

        // Line breaks (preserve double newlines as paragraphs)
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraph if not starting with block element
        if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<hr')) {
            html = '<p>' + html + '</p>';
        }

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p><br><\/p>/g, '');
        html = html.replace(/<p>(<h[234])/g, '$1');
        html = html.replace(/(<\/h[234]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr)/g, '$1');
        html = html.replace(/(<hr[^>]*>)<\/p>/g, '$1');

        return html;
    },

    // Format text for display - escapes HTML but preserves markdown formatting
    formatDisplayText(text) {
        if (!text) return '';
        return this.parseMarkdown(text);
    }
};