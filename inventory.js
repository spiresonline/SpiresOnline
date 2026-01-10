/**
 * SPIRES ONLINE | INVENTORY SYSTEM (inventory.js)
 * Alpha 1.2: Grid Rendering, Equipment Swapping, and Item Usage.
 */

import { Game } from './game.js';

export const Inventory = {
    items: [],
    capacity: 20,

    init() {
        // Initial rendering of the UI (Empty slots)
        this.renderGrid();
        this.updateGearUI();
        console.log("Inventory System: UI Linked.");
    },

    addItem(item) {
        if (this.items.length >= this.capacity) {
            Game.ui.log("Inventory Full! Cannot pick up item.");
            return false;
        }

        // Add to array
        this.items.push(item);
        Game.ui.log(`Loot: Acquired [${item.name}].`);
        
        // Refresh UI
        this.renderGrid();
        return true;
    },

    /**
     * Handles logic when a user clicks an item in the bag.
     * @param {number} index - Index in items array
     */
    useOrEquipItem(index) {
        const item = this.items[index];
        if (!item) return;

        if (item.type === 'consumable') {
            // 1. Consume Item
            if (item.onUse) {
                item.onUse(Game.state.player);
                Game.ui.log(`Used: ${item.name}`);
                this.items.splice(index, 1);
                
                // Update Vitals immediately
                Game.ui.updateVitals();
            }
        } 
        else if (item.type === 'gear') {
            // 2. Equip Gear
            const slot = item.slot;
            const currentEquipped = Game.state.player.gear[slot];

            // If slot occupied, move old item to bag (Swap)
            if (currentEquipped) {
                this.items[index] = currentEquipped; // Replace slot in bag with old item
                Game.ui.log(`Swapped: ${currentEquipped.name} for ${item.name}.`);
            } else {
                // If slot empty, remove from bag
                this.items.splice(index, 1);
                Game.ui.log(`Equipped: ${item.name}.`);
            }

            // Apply new item
            Game.state.player.gear[slot] = item;
            
            // Update Gear UI
            this.updateGearUI();
        }

        // Re-render grid to show changes
        this.renderGrid();
    },

    /**
     * Handles logic when a user clicks a gear slot to remove item.
     * @param {string} slot - 'head', 'body', 'legs', 'weapon'
     */
    unequipItem(slot) {
        const item = Game.state.player.gear[slot];
        if (!item) return;

        if (this.items.length >= this.capacity) {
            Game.ui.log("Inventory full. Cannot unequip.");
            return;
        }

        // Remove from body
        Game.state.player.gear[slot] = null;
        
        // Add back to bag
        this.items.push(item);
        Game.ui.log(`Unequipped: ${item.name}.`);

        this.updateGearUI();
        this.renderGrid();
    },

    /**
     * Draws the icons into the HTML grid.
     */
    renderGrid() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear current grid

        for (let i = 0; i < this.capacity; i++) {
            const el = document.createElement('div');
            el.className = 'slot-inv glass-panel hover:bg-white/10 transition cursor-pointer relative';
            
            if (this.items[i]) {
                const item = this.items[i];
                el.innerText = item.icon;
                el.title = `${item.name}\n${item.description}\nValue: ${item.value}`;
                el.onclick = () => this.useOrEquipItem(i);
                
                // Visual flare for rare items (Optional)
                if (item.value > 100) el.style.borderColor = '#3b82f6'; // Blue border
            }

            grid.appendChild(el);
        }
        
        // Update Gold Display inside Inventory Modal
        const goldEl = document.getElementById('txt-gold-inv');
        if(goldEl) goldEl.innerText = `${Game.state.player.gold} GOLD`;
    },

    /**
     * Updates the Character Doll slots (Left side of modal).
     */
    updateGearUI() {
        const slots = ['head', 'body', 'legs', 'weapon'];
        
        slots.forEach(slot => {
            const el = document.querySelector(`.slot-equip[data-slot="${slot}"]`);
            const item = Game.state.player.gear[slot];
            
            if (el) {
                // Clear previous click events to prevent stacking
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);

                if (item) {
                    newEl.innerText = item.icon;
                    newEl.style.borderColor = '#eab308'; // Gold border
                    newEl.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
                    newEl.title = `Equipped: ${item.name}`;
                    newEl.onclick = () => this.unequipItem(slot);
                } else {
                    newEl.innerText = slot.toUpperCase();
                    newEl.style.borderColor = 'rgba(255,255,255,0.1)';
                    newEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    newEl.onclick = null;
                }
            }
        });
    }
};