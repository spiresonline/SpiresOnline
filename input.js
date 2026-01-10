/**
 * SPIRES ONLINE | INPUT SYSTEM (input.js)
 * Handles player movement, interaction, and combat triggers.
 */

import { Game } from './game.js';
import { Inventory } from './inventory.js';
import { ItemDatabase } from './items.js';
import { Logic } from './logic.js';

export const Input = {
    keys: new Set(),
    lastMoveTime: 0,
    moveCooldown: 120, // Milliseconds between steps

    init() {
        // Listen for Key Down
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys.add(key);
            this.handleInstantActions(key);
        });

        // Listen for Key Up
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        // Start the continuous movement check
        this.startInputLoop();
    },

    handleInstantActions(key) {
        if (!Game.state.currentMap) return;

        // SPACE: Basic Attack
        if (key === ' ') {
            Logic.playerAttack();
        }

        // E: Interact (Pickup item or talk to NPC)
        if (key === 'e') {
            this.performInteraction();
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

        let dX = 0;
        let dY = 0;

        // Vertical Movement
        if (this.keys.has('w') || this.keys.has('arrowup')) dY = -1;
        else if (this.keys.has('s') || this.keys.has('arrowdown')) dY = 1;
        
        // Horizontal Movement (If not moving vertically)
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

        // 1. Map Boundary Check
        if (nX < 0 || nX >= currentMap.size || nY < 0 || nY >= currentMap.size) {
            return;
        }

        // 2. Collision Check (Entities/NPCs/Enemies)
        const isEntityInWay = entities.some(en => en.alive && en.x === nX && en.y === nY);

        if (!isEntityInWay) {
            player.x = nX;
            player.y = nY;
        }
    },

    performInteraction() {
        const { player, worldItems, entities } = Game.state;

        // 1. Check for Ground Items
        const itemIndex = worldItems.findIndex(i => i.x === player.x && i.y === player.y);
        
        if (itemIndex !== -1) {
            const worldItem = worldItems[itemIndex];
            const itemData = ItemDatabase[worldItem.itemId];
            
            if (Inventory.addItem(itemData)) {
                worldItems.splice(itemIndex, 1); // Remove from ground
            }
            return;
        }

        // 2. Check for NPCs (within 1 tile)
        entities.forEach(en => {
            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            if (dist <= 1 && en.type === 'bartender') {
                Game.state.player.hp = Game.state.player.maxHp;
                Game.ui.updateVitals();
                Game.ui.log("Bartender: 'Safe travels, wanderer. You look better already.'");
            }
        });
    }
};