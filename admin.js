/**
 * SPIRES ONLINE | ADMIN SYSTEM (admin.js)
 * Alpha 1.3: Debugging tools, God Mode, and World Manipulation.
 */

import { Game } from './game.js';
import { Inventory } from './inventory.js';
import { ItemDatabase } from './items.js';
import { Logic } from './logic.js'; // Needed to access spawning logic if moved there, or we do it here.

export const Admin = {
    godMode: false,
    isNight: false,

    init() {
        console.log("Admin System: Console Hooked.");
        this.bindEvents();
    },

    bindEvents() {
        // --- PLAYER CHEATS ---
        
        // Full Heal
        document.getElementById('btn-admin-heal').onclick = () => {
            const p = Game.state.player;
            p.hp = p.maxHp;
            p.mana = p.maxMana;
            Game.ui.updateVitals();
            Game.ui.log("ADMIN: Player fully restored.");
        };

        // Add XP (Boosts all skills for testing)
        document.getElementById('btn-admin-xp').onclick = () => {
            const p = Game.state.player;
            // We will define this 'addXp' function in the new game.js logic
            // For now, we manually boost the 'total' tracker
            p.xp += 1000;
            Game.ui.log("ADMIN: Added 1000 XP.");
            Game.ui.updateVitals();
        };

        // Add Talent Point
        document.getElementById('btn-admin-talent').onclick = () => {
            import('./talents.js').then(module => {
                module.Talents.availablePoints++;
                module.Talents.render(); // Refresh UI
                Game.ui.log("ADMIN: +1 Neural Point.");
            });
        };

        // Toggle God Mode
        document.getElementById('btn-admin-god').onclick = () => {
            this.godMode = !this.godMode;
            const btn = document.getElementById('btn-admin-god');
            if (this.godMode) {
                btn.classList.remove('text-red-400');
                btn.classList.add('text-green-400', 'font-black');
                btn.innerText = "GOD MODE: ON";
                Game.ui.log("ADMIN: God Mode Enabled. You cannot die.");
            } else {
                btn.classList.add('text-red-400');
                btn.classList.remove('text-green-400', 'font-black');
                btn.innerText = "Toggle God Mode";
                Game.ui.log("ADMIN: God Mode Disabled.");
            }
        };

        // --- WORLD CHEATS ---

        // Spawn Goblin
        document.getElementById('btn-admin-spawn-goblin').onclick = () => {
            const p = Game.state.player;
            // Spawn near player
            const x = Math.min(Game.state.currentMap.width - 1, p.x + 1);
            const y = p.y;
            
            Game.state.entities.push({
                type: 'goblin',
                x: x,
                y: y,
                hp: 50,
                maxHp: 50,
                alive: true,
                id: Date.now()
            });
            Game.ui.log(`ADMIN: Spawning Goblin at [${x},${y}].`);
        };

        // Spawn Random Loot
        document.getElementById('btn-admin-spawn-item').onclick = () => {
            const p = Game.state.player;
            const keys = Object.keys(ItemDatabase);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            
            Game.state.worldItems.push({
                x: p.x,
                y: p.y,
                itemId: randomKey,
                id: Date.now()
            });
            Game.ui.log(`ADMIN: Spawning ${randomKey}.`);
        };

        // Toggle Day/Night
        document.getElementById('btn-admin-time').onclick = () => {
            this.isNight = !this.isNight;
            const overlay = document.getElementById('overlay-time');
            const txtTime = document.getElementById('txt-time');

            if (this.isNight) {
                overlay.className = "view-layer z-0 pointer-events-none transition-colors duration-[2000ms] mix-blend-multiply bg-indigo-900/60";
                txtTime.innerText = "11:00 PM";
                Game.ui.log("ADMIN: Time set to Night.");
            } else {
                overlay.className = "view-layer z-0 pointer-events-none transition-colors duration-[2000ms] mix-blend-multiply bg-transparent";
                txtTime.innerText = "12:00 PM";
                Game.ui.log("ADMIN: Time set to Day.");
            }
        };
    }
};