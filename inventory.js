/**
 * SPIRES ONLINE | INVENTORY SYSTEM (inventory.js)
 * Alpha 1.3: Persistence, Rarity Colors, and Gear Swapping.
 */

import { Game } from './game.js';

export const Inventory = {
    capacity: 20,

    init() {
        this.renderGrid();
        this.updateGearUI();
        console.log("Inventory: Linked & Ready.");
    },

    get items() {
        // Helper to access state directly
        return Game.state.player.inventory || []; 
    },

    set items(newItems) {
        Game.state.player.inventory = newItems;
    },

    addItem(item) {
        // Initialize inventory array if missing (migration safety)
        if (!Game.state.player.inventory) Game.state.player.inventory = [];

        if (this.items.length >= this.capacity) {
            Game.ui.log("Inventory Full! Cannot pick up item.");
            return false;
        }

        // Add to array
        this.items.push(item);
        Game.ui.log(`Loot: Acquired [${item.name}].`);
        
        // Refresh UI & Save
        this.renderGrid();
        Game.saveGame(); 
        return true;
    },

    useOrEquipItem(index) {
        const item = this.items[index];
        if (!item) return;

        let actionTaken = false;

        if (item.type === 'consumable') {
            if (item.onUse) {
                // Execute effect
                item.onUse(Game.state.player);
                Game.ui.log(`Used: ${item.name}`);
                
                // Remove from bag
                this.items.splice(index, 1);
                Game.ui.updateVitals();
                actionTaken = true;
            }
        } 
        else if (item.type === 'gear') {
            const slot = item.slot;
            const currentEquipped = Game.state.player.gear[slot];

            // Swap Logic
            if (currentEquipped) {
                this.items[index] = currentEquipped;
                Game.ui.log(`Swapped: ${currentEquipped.name} for ${item.name}.`);
            } else {
                this.items.splice(index, 1);
                Game.ui.log(`Equipped: ${item.name}.`);
            }

            Game.state.player.gear[slot] = item;
            this.updateGearUI();
            actionTaken = true;
        }

        if (actionTaken) {
            this.renderGrid();
            Game.saveGame();
        }
    },

    unequipItem(slot) {
        const item = Game.state.player.gear[slot];
        if (!item) return;

        if (this.items.length >= this.capacity) {
            Game.ui.log("Inventory full. Cannot unequip.");
            return;
        }

        Game.state.player.gear[slot] = null;
        this.items.push(item);
        
        Game.ui.log(`Unequipped: ${item.name}.`);

        this.updateGearUI();
        this.renderGrid();
        Game.saveGame();
    },

    updateUI() {
        this.renderGrid();
        this.updateGearUI();
    },

    renderGrid() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;

        grid.innerHTML = ''; 

        // Ensure inventory exists
        if (!Game.state.player.inventory) Game.state.player.inventory = [];

        for (let i = 0; i < this.capacity; i++) {
            const el = document.createElement('div');
            el.className = 'slot-inv glass-panel hover:bg-white/10 transition cursor-pointer relative';
            
            if (this.items[i]) {
                const item = this.items[i];
                el.innerText = item.icon;
                
                // Tooltip
                el.title = `${item.name}\n${item.description}\nValue: ${item.value}g`;
                
                el.onclick = () => this.useOrEquipItem(i);
                
                // Rarity Borders
                if (item.value >= 400) el.style.borderColor = '#a855f7'; // Purple (Epic)
                else if (item.value >= 100) el.style.borderColor = '#3b82f6'; // Blue (Rare)
                else if (item.type === 'misc') el.style.borderColor = '#78716c'; // Grey (Junk)
            }

            grid.appendChild(el);
        }
        
        const goldEl = document.getElementById('txt-gold-inv');
        if(goldEl) goldEl.innerText = `${Game.state.player.gold} GOLD`;
    },

    updateGearUI() {
        const slots = ['head', 'body', 'legs', 'weapon'];
        
        slots.forEach(slot => {
            const el = document.querySelector(`.slot-equip[data-slot="${slot}"]`);
            const item = Game.state.player.gear[slot];
            
            if (el) {
                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);

                if (item) {
                    newEl.innerText = item.icon;
                    newEl.style.borderColor = '#eab308';
                    newEl.style.backgroundColor = 'rgba(234, 179, 8, 0.2)';
                    newEl.title = `Equipped: ${item.name} (+${item.stats.attack||0} Atk, +${item.stats.defense||0} Def)`;
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