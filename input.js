/**
 * SPIRES ONLINE | INPUT SYSTEM (input.js)
 * Alpha 1.2: NPC Dialogue, Window Toggles, and Movement.
 */

import { Game } from './game.js';
import { Inventory } from './inventory.js';
import { ItemDatabase } from './items.js';
import { Logic } from './logic.js';

export const Input = {
    keys: new Set(),
    lastMoveTime: 0,
    moveCooldown: 120, // Speed of movement (lower = faster)

    init() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys.add(key);
            this.handleInstantActions(e.key, key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        this.startInputLoop();
    },

    handleInstantActions(originalKey, lowerKey) {
        if (!Game.state.currentMap) return;

        // --- COMBAT & INTERACTION ---
        if (lowerKey === ' ') {
            Logic.playerAttack();
        }
        if (lowerKey === 'e') {
            this.performInteraction();
        }

        // --- UI HOTKEYS ---
        // Toggle Inventory (I)
        if (lowerKey === 'i') {
            window.UI.toggleModal('inventory');
        }
        // Toggle Talents (N - for Neural)
        if (lowerKey === 'n') {
            window.UI.toggleModal('talents');
        }
        // ESC: Close all windows
        if (originalKey === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        }
    },

    startInputLoop() {
        const checkMovement = () => {
            if (Game.state.isRunning) {
                this.processMovement();
            }
            requestAnimationFrame(checkMovement);
        };
        checkMovement();
    },

    processMovement() {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveCooldown) return;

        // Disable movement if a modal is open
        const isModalOpen = !document.getElementById('modal-inventory').classList.contains('hidden') ||
                            !document.getElementById('modal-profile').classList.contains('hidden') ||
                            !document.getElementById('modal-talents').classList.contains('hidden');
        
        if (isModalOpen) return;

        let dX = 0;
        let dY = 0;

        if (this.keys.has('w') || this.keys.has('arrowup')) dY = -1;
        else if (this.keys.has('s') || this.keys.has('arrowdown')) dY = 1;
        
        if (dY === 0) {
            if (this.keys.has('a') || this.keys.has('arrowleft')) dX = -1;
            else if (this.keys.has('d') || this.keys.has('arrowright')) dX = 1;
        }

        if (dX !== 0 || dY !== 0) {
            this.attemptMove(dX, dY);
            this.lastMoveTime = now;
        }
    },

    attemptMove(dX, dY) {
        const { player, currentMap, entities } = Game.state;
        const nX = player.x + dX;
        const nY = player.y + dY;

        // 1. Boundary Check
        if (nX < 0 || nX >= currentMap.width || nY < 0 || nY >= currentMap.height) return;

        // 2. Collision Check (Entities)
        const isEntityInWay = entities.some(en => en.alive && en.x === nX && en.y === nY);
        
        // 3. Wall Check (If map has walls defined)
        const isWall = currentMap.walls && currentMap.walls.some(w => w.x === nX && w.y === nY);

        if (!isEntityInWay && !isWall) {
            player.x = nX;
            player.y = nY;
        }
    },

    performInteraction() {
        const { player, worldItems, entities } = Game.state;

        // 1. Pick up Items
        const itemIndex = worldItems.findIndex(i => i.x === player.x && i.y === player.y);
        if (itemIndex !== -1) {
            const worldItem = worldItems[itemIndex];
            const itemData = ItemDatabase[worldItem.itemId];
            if (Inventory.addItem(itemData)) {
                worldItems.splice(itemIndex, 1);
            }
            return;
        }

        // 2. Talk to NPCs
        entities.forEach(en => {
            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            
            if (dist <= 1 && en.type === 'npc') {
                if (en.id === 'bartender') {
                    // Full Heal
                    player.hp = player.maxHp;
                    player.mana = player.maxMana;
                    Game.ui.updateVitals();
                    Game.ui.log("Barman: 'Here, a stim-shot on the house. You look terrible.'");
                } 
                else if (en.id === 'guard') {
                    Game.ui.log("Guard: 'Beyond this gate lies the Wilds. Don't die out there.'");
                }
            }
        });
    }
};