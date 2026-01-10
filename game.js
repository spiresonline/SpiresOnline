/**
 * SPIRES ONLINE | CORE ENGINE (game.js)
 * Alpha 1.3: Skill Mastery, Quest State, and Fixed Initialization.
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';
import { Inventory } from './inventory.js';
import { Talents } from './talents.js';
import { Admin } from './admin.js';

export const Game = {
    config: {
        tileSize: 64,
        fps: 60,
        version: "1.3.1"
    },

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
            xp: 0, 
            level: 1, 
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
            walls: [], 
            portals: [{ x: 29, y: 15, target: 'forest', targetX: 1, targetY: 15 }],
            npcs: [
                { id: 'bartender', x: 10, y: 10, type: 'npc', name: 'Barman', icon: '🍺' },
                { id: 'guard', x: 28, y: 14, type: 'npc', name: 'Gatekeeper', icon: '🛡️' },
                { id: 'questgiver', x: 15, y: 8, type: 'npc', name: 'Captain Vance', icon: '📜' }
            ]
        },
        forest: {
            id: 'forest',
            name: "Whispering Wilds",
            width: 50, height: 50,
            walls: [],
            portals: [{ x: 0, y: 15, target: 'town', targetX: 28, targetY: 15 }],
            enemies: []
        }
    },

    init() {
        console.log("Game: Initializing Systems...");
        
        // 1. Initialize Sub-Systems
        Renderer.init();
        Input.init();
        Inventory.init();
        Talents.init();
        Admin.init();

        this.setupUI();

        // 2. Bind Button with Safety
        const btnInit = document.getElementById('btn-initialize');
        if (btnInit) {
            btnInit.onclick = () => {
                console.log("Game: Start Button Clicked.");
                this.startGame();
            };
        } else {
            console.error("Game: 'btn-initialize' not found in DOM.");
        }

        this.ui.log(`Spires Engine v${this.config.version} Online.`);
    },

    setupUI() {
        window.UI = {
            toggleModal: (modalId) => {
                const modal = document.getElementById(`modal-${modalId}`);
                if (modal) {
                    const isHidden = modal.classList.contains('hidden');
                    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
                    
                    if (isHidden) {
                        modal.classList.remove('hidden');
                        if (modalId === 'profile') this.ui.updateProfile();
                        if (modalId === 'inventory') Inventory.updateUI();
                        if (modalId === 'talents') Talents.render();
                    }
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
            this.ui.log("Neural link established. Welcome back.");
        } else {
            console.error("Game: UI screens missing from DOM.");
        }
    },

    loadMap(mapId) {
        const mapData = this.maps[mapId];
        if (!mapData) return;

        this.state.currentMap = mapData;
        this.state.locationName = mapData.name;
        
        this.state.entities = [];
        if (mapData.npcs) {
            this.state.entities.push(...mapData.npcs.map(n => ({...n, alive: true})));
        }
        
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

    saveGame() {
        const data = JSON.stringify(this.state.player);
        localStorage.setItem('spires_save_alpha1', data);
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
            const hpPct = (p.hp / p.maxHp) * 100;
            const manaPct = (p.mana / p.maxMana) * 100;
            
            document.getElementById('orb-hp').style.height = `${hpPct}%`;
            document.getElementById('orb-mana').style.height = `${manaPct}%`;
            document.getElementById('txt-hp').innerText = Math.ceil(p.hp);
            document.getElementById('txt-mana').innerText = Math.ceil(p.mana);

            const xpPct = (p.xp % 1000) / 10;
            document.getElementById('bar-xp').style.width = `${xpPct}%`;
            document.getElementById('val-total-level').innerText = p.level;
            document.getElementById('val-xp-rem').innerText = `${p.xp} XP`;
        },

        updateProfile() {
            const p = Game.state.player;
            document.getElementById('profile-name').innerText = "WANDERER";
            document.getElementById('profile-level').innerText = p.level;
            
            const list = document.getElementById('profile-skills');
            if(list) {
                list.innerHTML = '';
                for (const [key, skill] of Object.entries(p.skills)) {
                    const row = document.createElement('div');
                    row.className = "flex justify-between items-center text-xs border-b border-white/5 pb-1";
                    row.innerHTML = `
                        <span class="uppercase font-bold text-slate-400">${key}</span>
                        <div class="flex items-center space-x-4">
                            <span class="text-blue-500">Lv.${skill.level}</span>
                            <span class="text-slate-600">${skill.xp} XP</span>
                        </div>
                    `;
                    list.appendChild(row);
                }
            }
        },

        showFloatText(x, y, text, color = '#fff') {
            const layer = document.getElementById('layer-fx');
            const el = document.createElement('div');
            el.innerText = text;
            
            const { tileSize } = Game.config;
            const canvas = document.getElementById('game-canvas');
            const cameraX = (canvas.width / 2) - (Game.state.player.x * tileSize) - (tileSize / 2);
            const cameraY = (canvas.height / 2) - (Game.state.player.y * tileSize) - (tileSize / 2);
            
            const screenX = cameraX + x * tileSize + (tileSize/2);
            const screenY = cameraY + y * tileSize;

            el.style.left = `${screenX}px`;
            el.style.top = `${screenY}px`;
            el.style.color = color;
            el.className = "absolute text-lg font-black text-shadow pointer-events-none transition-all duration-1000 ease-out transform -translate-x-1/2";
            
            layer.appendChild(el);
            requestAnimationFrame(() => {
                el.style.transform = "translate(-50%, -50px)";
                el.style.opacity = "0";
            });
            setTimeout(() => el.remove(), 1000);
        }
    }
};

// Start initialization
Game.init();