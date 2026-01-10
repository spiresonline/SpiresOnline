/**
 * SPIRES ONLINE | MASTER ENGINE (game.js)
 * Alpha 1.3.3: Emergency Initialization Fix
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';
import { Inventory } from './inventory.js';
import { Talents } from './talents.js';
import { Admin } from './admin.js';

export const Game = {
    config: { tileSize: 64, fps: 60, version: "1.3.3" },
    state: {
        isRunning: false,
        locationName: "Unknown",
        currentMap: null,
        frame: 0,
        quests: [],
        player: {
            x: 15, y: 15,
            hp: 100, maxHp: 100,
            mana: 100, maxMana: 100,
            xp: 0, level: 1, 
            skills: {
                blades: { level: 1, xp: 0 },
                defense: { level: 1, xp: 0 },
                vitality: { level: 1, xp: 0 } 
            },
            gold: 50,
            gear: { weapon: null, body: null, head: null, legs: null },
            inventory: []
        },
        entities: [],
        worldItems: []
    },

    maps: {
        town: {
            id: 'town',
            name: "Spires Outpost",
            width: 30, height: 30,
            portals: [{ x: 29, y: 15, target: 'forest', targetX: 1, targetY: 15 }],
            npcs: [
                { id: 'bartender', x: 10, y: 10, type: 'npc', name: 'Barman', icon: '🍺' },
                { id: 'guard', x: 28, y: 14, type: 'npc', name: 'Gatekeeper', icon: '🛡️' },
                { id: 'questgiver', x: 15, y: 8, type: 'npc', name: 'Captain Vance', icon: '📜' }
            ]
        },
        forest: {
            id: 'forest', name: "Whispering Wilds", width: 50, height: 50,
            portals: [{ x: 0, y: 15, target: 'town', targetX: 28, targetY: 15 }],
            enemies: []
        }
    },

    async init() {
        console.log("--- SYSTEM STARTUP ---");
        
        // 1. Setup UI Globals first so they are available immediately
        this.setupUI();

        // 2. Initialize Sub-Systems (Wrapped in try/catch to prevent total crash)
        try { await Renderer.init(); console.log("Renderer OK"); } catch(e) { console.error("Renderer Fail", e); }
        try { Input.init(); console.log("Input OK"); } catch(e) { console.error("Input Fail", e); }
        try { Inventory.init(); console.log("Inventory OK"); } catch(e) { console.error("Inventory Fail", e); }
        try { Talents.init(); console.log("Talents OK"); } catch(e) { console.error("Talents Fail", e); }
        try { Admin.init(); console.log("Admin OK"); } catch(e) { console.error("Admin Fail", e); }

        // 3. Force-Bind the button using a safer method
        this.bindStartButton();
    },

    bindStartButton() {
        const btn = document.getElementById('btn-initialize');
        if (btn) {
            // Remove old listeners to be safe
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = document.getElementById('btn-initialize');
            
            newBtn.addEventListener('click', () => {
                console.log("INITIALIZE SESSION CLICKED");
                this.startGame();
            });
            console.log("SUCCESS: Button is hot and ready.");
        } else {
            console.error("FATAL: Button 'btn-initialize' missing from HTML.");
            // Fallback: Try again in 1 second
            setTimeout(() => this.bindStartButton(), 1000);
        }
    },

    setupUI() {
        window.UI = {
            toggleModal: (modalId) => {
                const modal = document.getElementById(`modal-${modalId}`);
                if (!modal) return;
                const isHidden = modal.classList.contains('hidden');
                document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
                if (isHidden) {
                    modal.classList.remove('hidden');
                    if (modalId === 'profile') this.ui.updateProfile();
                    if (modalId === 'inventory') Inventory.updateUI();
                    if (modalId === 'talents') Talents.render();
                }
            }
        };
    },

    startGame() {
        const screenAuth = document.getElementById('screen-auth');
        const screenHud = document.getElementById('screen-hud');

        if (screenAuth && screenHud) {
            screenAuth.classList.add('hidden');
            screenHud.classList.remove('hidden');
            
            this.loadMap('town');
            this.state.isRunning = true;
            this.loop();
            this.ui.log("Connection stable. Welcome, Wanderer.");
        } else {
            console.error("CRITICAL: Auth or HUD screens missing.");
        }
    },

    loadMap(mapId) {
        const mapData = this.maps[mapId];
        if (!mapData) return;
        this.state.currentMap = mapData;
        this.state.entities = mapData.npcs ? [...mapData.npcs.map(n => ({...n, alive: true}))] : [];
        const locText = document.getElementById('txt-location');
        if (locText) locText.innerText = mapData.name;
    },

    loop() {
        if (!this.state.isRunning) return;
        this.state.frame++;
        Logic.update();
        Renderer.draw();
        requestAnimationFrame(() => this.loop());
    },

    saveGame() {
        localStorage.setItem('spires_save', JSON.stringify(this.state.player));
    },

    ui: {
        log(msg) {
            const logs = document.getElementById('chat-logs');
            if (!logs) return;
            const entry = document.createElement('div');
            entry.className = "text-slate-300 py-0.5 border-l-2 border-blue-500/50 pl-2 text-[11px]";
            entry.innerHTML = msg;
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        },
        updateVitals() {
            const p = Game.state.player;
            const hpOrb = document.getElementById('orb-hp');
            const manaOrb = document.getElementById('orb-mana');
            if(hpOrb) hpOrb.style.height = `${(p.hp / p.maxHp) * 100}%`;
            if(manaOrb) manaOrb.style.height = `${(p.mana / p.maxMana) * 100}%`;
            
            const hpText = document.getElementById('txt-hp');
            if(hpText) hpText.innerText = Math.ceil(p.hp);
        },
        updateProfile() {
            const lvl = document.getElementById('profile-level');
            if(lvl) lvl.innerText = Game.state.player.level;
        },
        showFloatText(x, y, text, color = '#fff') {
            const layer = document.getElementById('layer-fx');
            if (!layer) return;
            const el = document.createElement('div');
            el.innerText = text;
            el.className = "absolute text-sm font-black pointer-events-none";
            el.style.color = color;
            layer.appendChild(el);
            setTimeout(() => el.remove(), 1000);
        }
    }
};

// Start logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}