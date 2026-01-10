/**
 * SPIRES ONLINE | CORE ENGINE (game.js)
 * Master Controller for State and Lifecycle
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';
import { Inventory } from './inventory.js';

export const Game = {
    config: {
        tileSize: 64,
        fps: 60,
    },

    state: {
        isRunning: false,
        currentMap: null,
        frame: 0,
        player: {
            x: 5, y: 5,
            hp: 100, maxHp: 100,
            mana: 100, maxMana: 100,
            energy: 100, maxEnergy: 100,
            mood: 100, maxMood: 100,
            gold: 0,
            gear: {
                weapon: null,
                body: null
            }
        },
        entities: [],
        worldItems: [
            { x: 7, y: 7, itemId: "power_blade" }
        ]
    },

    maps: {
        forest: {
            id: 'forest', size: 20,
            enemies: [
                { x: 10, y: 10, type: 'goblin', hp: 50, maxHp: 50, alive: true },
                { x: 12, y: 15, type: 'goblin', hp: 50, maxHp: 50, alive: true }
            ]
        },
        bar: {
            id: 'bar', size: 10,
            enemies: [
                { x: 5, y: 2, type: 'bartender', alive: true }
            ]
        }
    },

    init() {
        // UI Interaction Listeners
        const btnInit = document.getElementById('btn-initialize');
        if (btnInit) {
            btnInit.onclick = () => {
                document.getElementById('screen-auth').classList.add('hidden');
                document.getElementById('screen-hub').classList.remove('hidden');
            };
        }

        document.querySelectorAll('.map-card').forEach(btn => {
            btn.onclick = () => this.start(btn.dataset.map);
        });

        // Initialize Systems
        Renderer.init();
        Input.init();
        Inventory.init();

        this.ui.log("System Initialized. Awaiting Input.");
    },

    start(mapId) {
        const selectedMap = this.maps[mapId];
        if (!selectedMap) return;

        this.state.currentMap = selectedMap;
        // Deep copy enemies to prevent modifying the template
        this.state.entities = selectedMap.enemies.map(e => ({ ...e }));
        
        this.state.isRunning = true;
        
        document.getElementById('screen-hub').classList.add('hidden');
        document.getElementById('screen-hud').classList.remove('hidden');
        
        this.ui.log(`Zone Entered: ${mapId.toUpperCase()}`);
        this.loop();
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
                entry.className = "text-slate-300 border-l-2 border-blue-500 pl-2 py-0.5 my-1 bg-white/5";
                entry.innerHTML = `<span class="opacity-30 text-[9px] mr-2">${new Date().toLocaleTimeString()}</span> ${msg}`;
                logs.appendChild(entry);
                logs.scrollTop = logs.scrollHeight;
            }
        },

        updateVitals() {
            const p = Game.state.player;
            const hpText = document.getElementById('txt-hp');
            const hpBar = document.getElementById('bar-hp');
            
            if (hpText) hpText.innerText = `${Math.ceil(p.hp)}/${p.maxHp}`;
            if (hpBar) hpBar.style.width = `${(p.hp / p.maxHp) * 100}%`;
            
            const goldText = document.getElementById('txt-gold');
            if (goldText) goldText.innerText = `GOLD: ${p.gold}`;
        }
    }
};

// Start the Application
Game.init();