/**
 * SPIRES ONLINE | CORE ENGINE (game.js)
 * Alpha 1.2: UI Modals, Zone Management, Asset Orchestration & Talents.
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';
import { Inventory } from './inventory.js';
import { Talents } from './talents.js'; // NEW IMPORT

export const Game = {
    config: {
        tileSize: 64,
        fps: 60,
    },

    state: {
        isRunning: false,
        locationName: "Unknown",
        currentMap: null,
        frame: 0,
        player: {
            x: 15, y: 15, // Centered in town
            hp: 100, maxHp: 100,
            mana: 100, maxMana: 100,
            xp: 0, maxXp: 100, level: 1,
            gold: 50,
            gear: { weapon: null, body: null, head: null, legs: null },
            stats: { str: 10, agi: 10, int: 10, sta: 10 }
        },
        entities: [],
        worldItems: []
    },

    maps: {
        town: {
            id: 'town',
            name: "Spires Outpost",
            width: 30, height: 30,
            walls: [], 
            portals: [
                { x: 29, y: 15, target: 'forest', targetX: 1, targetY: 15 } // Gate to forest
            ],
            npcs: [
                { id: 'bartender', x: 10, y: 10, type: 'npc', name: 'Barman', icon: '🍺' },
                { id: 'guard', x: 28, y: 14, type: 'npc', name: 'Gatekeeper', icon: '🛡️' }
            ]
        },
        forest: {
            id: 'forest',
            name: "Whispering Wilds",
            width: 50, height: 50,
            walls: [],
            portals: [
                { x: 0, y: 15, target: 'town', targetX: 28, targetY: 15 } // Gate back to town
            ],
            enemies: [] // Spawns handled by Logic
        }
    },

    init() {
        // 1. Initialize Sub-Systems
        Renderer.init();
        Input.init();
        Inventory.init();
        Talents.init(); // NEW INITIALIZATION

        // 2. Setup Global UI (For HTML Buttons)
        this.setupUI();

        // 3. Bind Initial Event Listeners
        const btnInit = document.getElementById('btn-initialize');
        if (btnInit) {
            btnInit.onclick = () => this.startGame();
        }

        this.ui.log("System Online. Alpha 1.2 Ready.");
    },

    setupUI() {
        // Attach UI helpers to window so HTML onclick works
        window.UI = {
            toggleModal: (modalId) => {
                const modal = document.getElementById(`modal-${modalId}`);
                if (modal) {
                    const isHidden = modal.classList.contains('hidden');
                    // Close all others first
                    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
                    
                    if (isHidden) {
                        modal.classList.remove('hidden');
                        this.ui.log(`UI: Opened ${modalId.toUpperCase()} panel.`);
                        // Refresh specific UI data
                        if (modalId === 'profile') this.ui.updateProfile();
                        if (modalId === 'inventory') Inventory.updateUI();
                        if (modalId === 'talents') Talents.render(); // Ensure talents refresh
                    }
                }
            }
        };
    },

    startGame() {
        document.getElementById('screen-auth').classList.add('hidden');
        document.getElementById('screen-hud').classList.remove('hidden');
        
        // Start in Town
        this.loadMap('town');
        this.state.isRunning = true;
        this.loop();
    },

    loadMap(mapId) {
        const mapData = this.maps[mapId];
        if (!mapData) return;

        this.state.currentMap = mapData;
        this.state.locationName = mapData.name;
        
        // Reset Entities for the zone
        this.state.entities = [];
        if (mapData.npcs) {
            this.state.entities.push(...mapData.npcs.map(n => ({...n})));
        }
        
        // Update UI Text
        const locText = document.getElementById('txt-location');
        if (locText) locText.innerText = mapData.name;

        this.ui.log(`Zone Entered: ${mapData.name}`);
    },

    loop() {
        if (!this.state.isRunning) return;

        this.state.frame++;
        
        Logic.update();
        Renderer.draw();

        requestAnimationFrame(() => this.loop());
    },

    ui: {
        log(msg) {
            const logs = document.getElementById('chat-logs');
            if (logs) {
                const entry = document.createElement('div');
                entry.className = "text-slate-300 py-0.5 border-l-2 border-blue-500/50 pl-2 hover:bg-white/5 transition";
                entry.innerHTML = `<span class="opacity-40 text-[9px] mr-2 font-mono">${new Date().toLocaleTimeString()}</span>${msg}`;
                logs.appendChild(entry);
                logs.scrollTop = logs.scrollHeight;
            }
        },

        updateVitals() {
            const p = Game.state.player;
            
            // Orbs
            const hpPct = (p.hp / p.maxHp) * 100;
            const manaPct = (p.mana / p.maxMana) * 100;
            
            const orbHp = document.getElementById('orb-hp');
            const orbMana = document.getElementById('orb-mana');
            
            if (orbHp) orbHp.style.height = `${hpPct}%`;
            if (orbMana) orbMana.style.height = `${manaPct}%`;

            document.getElementById('txt-hp').innerText = Math.ceil(p.hp);
            document.getElementById('txt-mana').innerText = Math.ceil(p.mana);

            // XP Bar
            const xpPct = (p.xp / p.maxXp) * 100;
            const xpBar = document.getElementById('bar-xp');
            if (xpBar) xpBar.style.width = `${xpPct}%`;
        },

        updateProfile() {
            const p = Game.state.player;
            document.getElementById('profile-name').innerText = "WANDERER";
            document.getElementById('profile-level').innerText = p.level;
            
            // Stats update in Profile Modal would go here if we added IDs to the HTML spans
        }
    }
};

Game.init();