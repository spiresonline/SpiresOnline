/**
 * SPIRES ONLINE | LOOT SYSTEM (loot.js)
 * Alpha 1.2: Weighted Drop Tables for New Gear.
 */

import { ItemDatabase } from './items.js';

export const LootTable = {
    // --- GOBLIN DROPS ---
    // High chance for junk, low chance for gear
    "goblin": [
        { itemId: "scrap_metal", chance: 0.50 },    // 50% Common
        { itemId: "rusty_shiv", chance: 0.15 },     // 15% Weapon
        { itemId: "worn_jacket", chance: 0.10 },    // 10% Armor
        { itemId: "health_stim", chance: 0.20 },    // 20% Consumable
        { itemId: "mining_helmet", chance: 0.05 }   // 5%  Rare Gear
    ],

    // --- FUTURE ENEMY PLACEHOLDERS ---
    "wolf": [
        { itemId: "wolf_pelt", chance: 0.80 },
        { itemId: "cargo_pants", chance: 0.10 }     // Stole someone's pants?
    ],

    /**
     * Rolls the dice based on enemy type to determine if an item drops.
     * @param {string} enemyType 
     * @returns {string|null} The ID of the item to drop, or null.
     */
    generateDrop(enemyType) {
        const table = this[enemyType];
        if (!table) return null;

        // 1. Determine if a drop happens at all (e.g., 50% chance to drop NOTHING)
        if (Math.random() > 0.6) return null; 

        // 2. Determine WHICH item drops
        const roll = Math.random();
        let cumulativeChance = 0;

        // Normalize weights if they don't add up to 1 (optional safety)
        const totalWeight = table.reduce((sum, item) => sum + item.chance, 0);
        const normalizedRoll = roll * totalWeight;

        for (const drop of table) {
            cumulativeChance += drop.chance;
            if (normalizedRoll < cumulativeChance) {
                return drop.itemId;
            }
        }
        
        return null; 
    }
};