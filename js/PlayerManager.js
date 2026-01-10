import { GameDatabase } from './GameDataModels.js';

export class PlayerManager {
    constructor() {
        // --- SPATIAL DATA (New for Grid) ---
        this.x = 7; // Start near middle of view
        this.y = 5; 
        this.mapID = "map_start_01";
        this.facing = "down"; // for sprite direction later

        // --- RPG STATS ---
        this.name = "Drifter";
        this.level = 1;
        this.xp = 0;
        
        // Base Attributes
        this.attributes = {
            STR: 5, // Strength
            AGI: 5, // Agility
            CON: 5, // Constitution
            INT: 5, // Intelligence
            PER: 5, // Perception
            CHA: 5  // Charisma
        };

        // Derived Vitals
        this.maxHP = 100;
        this.currentHP = 100;
        this.maxStamina = 50;
        this.currentStamina = 50;
        
        // Inventory
        this.inventory = []; 
        this.equipment = {
            head: null,
            chest: null,
            mainHand: null,
            offHand: null,
            legs: null,
            feet: null
        };

        // Status Effects
        this.activeStatusEffects = [];
    }

    // --- MOVEMENT LOGIC ---
    move(dx, dy) {
        // Future: Check collisions here (walls, monsters)
        this.x += dx;
        this.y += dy;
        
        // Update facing for sprite rendering
        if (dy < 0) this.facing = "up";
        if (dy > 0) this.facing = "down";
        if (dx < 0) this.facing = "left";
        if (dx > 0) this.facing = "right";

        // Consume Stamina on move?
        // this.currentStamina -= 1;
    }

    // --- RPG LOGIC ---
    recalculateStats() {
        // Example Formulas (matches your Excel logic)
        this.maxHP = 50 + (this.attributes.CON * 10);
        this.maxStamina = 20 + (this.attributes.CON * 2) + (this.attributes.AGI * 2);
        
        // Clamp current values
        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
    }

    addItem(itemId, qty = 1) {
        for (let i = 0; i < qty; i++) {
            this.inventory.push(itemId);
        }
        console.log(`Added ${qty}x ${itemId}`);
    }

    removeItem(itemId) {
        const idx = this.inventory.indexOf(itemId);
        if (idx > -1) {
            this.inventory.splice(idx, 1);
            return true;
        }
        return false;
    }
}