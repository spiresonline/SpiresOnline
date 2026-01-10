/**
 * SPIRES ONLINE | LOOT SYSTEM (loot.js)
 * Alpha 1.3: Expanded Drop Tables and Rare Rolls.
 */

import { ItemDatabase } from './items.js';

export const LootTable = {
    // --- ENEMY TABLES ---
    
    "goblin": [
        { itemId: "scrap_metal", chance: 0.40 },   // 40% Junk
        { itemId: "goblin_ear", chance: 0.25 },    // 25% Trophy (Good for selling)
        { itemId: "rusty_shiv", chance: 0.10 },    // 10% Weapon
        { itemId: "health_stim", chance: 0.15 },   // 15% Heal
        { itemId: "worn_jacket", chance: 0.05 },   // 5% Armor
        { itemId: "iron_helm", chance: 0.01 }      // 1% RARE
    ],

    "wolf": [
        { itemId: "wolf_pelt", chance: 0.60 },
        { itemId: "health_stim", chance: 0.10 },
        { itemId: "cargo_pants", chance: 0.05 }    // Remains of previous adventurer...
    ],

    // For Admin "Spawn Loot" or future chests
    "chest_common": [
        { itemId: "health_stim", chance: 0.50 },
        { itemId: "mana_crystal", chance: 0.30 },
        { itemId: "leather_armor", chance: 0.20 }
    ],

    "chest_rare": [
        { itemId: "steel_sword", chance: 0.40 },
        { itemId: "plate_mail", chance: 0.30 },
        { itemId: "medkit", chance: 0.30 }
    ],

    /**
     * Rolls the dice based on source type.
     * @param {string} sourceKey - 'goblin', 'wolf', etc.
     * @returns {string|null} Item ID or null.
     */
    generateDrop(sourceKey) {
        const table = this[sourceKey];
        if (!table) return null;

        // 1. Chance to drop NOTHING (30% for enemies)
        if (Math.random() < 0.3) return null; 

        // 2. Weighted Roll
        const roll = Math.random();
        let cumulativeChance = 0;
        
        // Normalize weights relative to the roll if needed, 
        // but here we just check threshold.
        // To make it accurate, we sum weights first.
        const totalWeight = table.reduce((sum, item) => sum + item.chance, 0);
        const target = roll * totalWeight;

        for (const drop of table) {
            cumulativeChance += drop.chance;
            if (target < cumulativeChance) {
                return drop.itemId;
            }
        }
        
        return table[0].itemId; // Fallback to first item
    }
};