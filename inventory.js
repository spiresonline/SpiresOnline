/**
 * SPIRES ONLINE | INVENTORY SYSTEM (inventory.js)
 * Manages item storage, gold, and equipment state.
 */

import { Game } from './game.js';

export const Inventory = {
    items: [],
    capacity: 20,

    init() {
        console.log("Inventory System Synchronized.");
        this.updateUI();
    },

    addItem(item) {
        if (this.items.length >= this.capacity) {
            Game.ui.log("Inventory Error: Capacity reached.");
            return false;
        }

        this.items.push(item);
        Game.ui.log(`Loot: Acquired [${item.name}].`);
        this.updateUI();
        return true;
    },

    removeItem(index) {
        if (index > -1 && index < this.items.length) {
            this.items.splice(index, 1);
            this.updateUI();
        }
    },

    equipItem(itemIndex) {
        const item = this.items[itemIndex];
        
        if (!item || item.type !== 'gear') {
            Game.ui.log("Action Error: Item is not equippable gear.");
            return;
        }

        const slot = item.slot;
        const currentEquipped = Game.state.player.gear[slot];

        // Swap item if slot is occupied
        if (currentEquipped) {
            this.items.push(currentEquipped);
        }

        // Apply new gear
        Game.state.player.gear[slot] = item;
        this.items.splice(itemIndex, 1);
        
        Game.ui.log(`System: Equipped [${item.name}] to ${slot.toUpperCase()} slot.`);
        this.updateUI();
    },

    updateUI() {
        const p = Game.state.player;
        
        // Update Gold Display in HUD
        const goldDisplay = document.getElementById('txt-gold');
        if (goldDisplay) {
            goldDisplay.innerText = `GOLD: ${p.gold}`;
        }

        // Update Vitals for any stat changes
        Game.ui.updateVitals();
    }
};