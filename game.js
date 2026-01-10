/**
 * SPIRES ONLINE | MASTER ENGINE (game.js)
 * Master Entry Point for ES Module Architecture
 */

import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { Logic } from './logic.js';

export const Game = {
    config: {
        tileSize: 64,
        fps: 60,
    },

    state: {
        currentMap: null,
        isRunning: false,
        player: {
            x: 5, y: 5,
            hp: 100, maxHp: 100,
            mana: 100, maxMana: 100,
            energy: 100, maxEnergy: 100,
            mood: 100, maxMood: 100,
            gold: 0
        },
        entities: [],
        frame: 0
    },

    maps: {
        forest: {
            id: 'forest', size: 30,
            walls: [{ x: 10, y: 10 }, { x: 10, y: 11 }],
            enemies: [
                { id: 1, x: 12, y: 12, hp: 60, maxHp: 60, type: 'goblin', alive: true },
                { id: 2, x: 18, y: 15, hp: 60, maxHp: 60, type: 'goblin', alive: true }
            ]
        },
        bar: {
            id: 'bar', size: 12,
            walls: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }],
            enemies: [{ id: 99, x: 6, y: 2, type: 'bartender', alive: true }]
        }
    },

    init() {
        // UI Listeners
        document.getElementById('btn-initialize').onclick = () => this.ui.showHub();
        document.getElementById('btn-settings').onclick = () => this.ui.toggleSettings();
        document.getElementById('btn-exit').onclick = () => this.exitToHub();
        document.getElementById('btn-chat-toggle').onclick = () => this.ui.toggleChat();

        document.querySelectorAll('.map-card').forEach(card => {
            card.onclick = () => this.loadMap(card.dataset.map);
        });

        // Initialize Systems
        Renderer.init();
        Input.init();

        this.ui.log("System Online. GitHub Link Verified.");
    },

    loadMap(mapId) {
        const mapData = this.maps[mapId];
        if (!mapData) return;

        this.state.currentMap = mapData;
        this.state.entities = mapData.enemies.map(en => ({ ...en }));
        this.state.player.x = Math.floor(mapData.size / 2);
        this.state.player.y = mapData.size - 2;

        this.ui.showHUD();
        this.state.isRunning = true;
        this.ui.log(`Zone Loaded: ${mapId.toUpperCase()}. Stay vigilant.`);
        
        this.loop();
    },

    exitToHub() {
        this.state.isRunning = false;
        this.state.currentMap = null;
        this.ui.showHub();
    },

    loop() {
        if (!this.state.isRunning) return;
        this.state.frame++;
        
        // Logical update BEFORE Render for performance consistency
        Logic.update();
        Renderer.draw();

        requestAnimationFrame(() => this.loop());
    },

    ui: {
        showHub() {
            document.getElementById('screen-auth').classList.add('hidden');
            document.getElementById('screen-hud').classList.add('hidden');
            document.getElementById('screen-hub').classList.remove('hidden');
        },
        showHUD() {
            document.getElementById('screen-hub').classList.add('hidden');
            document.getElementById('screen-hud').classList.remove('hidden');
        },
        toggleSettings() {
            document.getElementById('panel-settings').classList.toggle('hidden');
        },
        toggleChat() {
            document.getElementById('chat-container').classList.toggle('chat-minimized');
        },
        log(msg) {
            const logs = document.getElementById('chat-logs');
            const entry = document.createElement('div');
            entry.className = "text-slate-300 border-l-2 border-blue-500 pl-2 py-0.5 my-1 bg-white/5";
            entry.innerHTML = `<span class="opacity-30 text-[9px] mr-2">${new Date().toLocaleTimeString()}</span> ${msg}`;
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        },
        updateVitals() {
            const p = Game.state.player;
            document.getElementById('txt-hp').innerText = `${Math.floor(p.hp)}/${p.maxHp}`;
            document.getElementById('bar-hp').style.width = `${(p.hp / p.maxHp) * 100}%`;
            document.getElementById('txt-mana').innerText = `${Math.floor(p.mana)}/${p.maxMana}`;
            document.getElementById('bar-mana').style.width = `${(p.mana / p.maxMana) * 100}%`;
            document.getElementById('txt-energy').innerText = `${Math.floor(p.energy)}/${p.maxEnergy}`;
            document.getElementById('bar-energy').style.width = `${(p.energy / p.maxEnergy) * 100}%`;
            document.getElementById('txt-mood').innerText = `${Math.floor(p.mood)}/${p.maxMood}`;
            document.getElementById('bar-mood').style.width = `${(p.mood / p.maxMood) * 100}%`;
        }
    }
};

Game.init();