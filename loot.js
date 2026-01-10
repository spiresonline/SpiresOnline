/**
 * SPIRES ONLINE | LOOT SYSTEM (loot.js)
 * Manages drop probabilities and item generation on kill.
 */

import { ItemDatabase } from './items.js';

export const LootTable = {
    // Probabilities for each enemy type
    "goblin": [
        { itemId: "scrap_metal", chance: 0.7 },   // 70% chance
        { itemId: "health_stim", chance: 0.2 },   // 20% chance
        { itemId: "tactical_vest", chance: 0.05 } // 5% chance
    ],

    /**
     * Rolls the dice based on enemy type to determine if an item drops.
     * @param {string} enemyType 
     * @returns {string|null} The ID of the item to drop, or null.
     */
    generateDrop(enemyType) {
        const table = this[enemyType];
        if (!table) return null;

        const roll = Math.random();
        let cumulativeChance = 0;

        for (const drop of table) {
            cumulativeChance += drop.chance;
            if (roll < cumulativeChance) {
                return drop.itemId;
            }
        }
        
        return null; // No item dropped
    }
};