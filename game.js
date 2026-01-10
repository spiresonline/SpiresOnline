/**
 * SPIRES ONLINE | MASTER ENGINE (game.js)
 * Alpha 1.3.2: Aggressive Initialization & Error Catching
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';
import { Inventory } from './inventory.js';
import { Talents } from './talents.js';
import { Admin } from './admin.js';

export const Game = {
    config: { tileSize: 64, fps: 60, version: "1.3.2" },
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
        console.log("CORE: Initializing Spires...");
        
        try {
            // 1. Initialize Sub-Systems
            await Renderer.init();
            Input.init();
            Inventory.init();
            Talents.init();
            Admin.init();

            this.setupUI();

            // 2. Aggressive Button Binding
            const tryBind = () => {
                const btn = document.getElementById('btn-initialize');
                if (btn) {
                    btn.onclick = (e) => {
                        e.preventDefault();
                        console.log("CORE: Initialize Clicked");
                        this.startGame();
                    };
                    console.log("CORE: Button successfully bound.");
                } else {
                    console.warn("CORE: Button not found, retrying...");
                    setTimeout(tryBind, 500);
                }
            };
            tryBind();

        } catch (err) {
            console.error("CRITICAL STARTUP ERROR:", err);
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
        console.log("CORE: Executing startGame()");
        const screenAuth = document.getElementById('screen-auth');
        const screenHud = document.getElementById('screen-hud');

        if (screenAuth && screenHud) {
            screenAuth.style.display = 'none'; // Force hide
            screenHud.classList.remove('hidden');
            screenHud.style.display = 'flex'; // Force show
            
            this.loadMap('town');
            this.state.isRunning = true;
            this.loop();
            this.ui.log("Neural link established.");
        } else {
            alert("UI Elements missing! Check index.html for screen-auth and screen-hud.");
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
            entry.className = "text-slate-300 py-0.5 border-l-2 border-blue-500/50 pl-2 text-xs";
            entry.innerHTML = msg;
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        },
        updateVitals() {
            const p = Game.state.player;
            document.getElementById('orb-hp').style.height = `${(p.hp / p.maxHp) * 100}%`;
            document.getElementById('orb-mana').style.height = `${(p.mana / p.maxMana) * 100}%`;
            document.getElementById('txt-hp').innerText = Math.ceil(p.hp);
            document.getElementById('txt-mana').innerText = Math.ceil(p.mana);
            document.getElementById('val-total-level').innerText = p.level;
        },
        updateProfile() {
            document.getElementById('profile-level').innerText = Game.state.player.level;
        },
        showFloatText(x, y, text, color = '#fff') {
            const layer = document.getElementById('layer-fx');
            if (!layer) return;
            const el = document.createElement('div');
            el.innerText = text;
            el.className = "absolute text-lg font-black pointer-events-none transition-all duration-1000";
            el.style.color = color;
            layer.appendChild(el);
            setTimeout(() => el.remove(), 1000);
        }
    }
};

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});