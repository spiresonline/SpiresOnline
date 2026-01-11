import { CONFIG } from './Config.js';

export class Player {
    constructor() {
        // --- SPATIAL DATA ---
        this.x = CONFIG.STARTING_X;
        this.y = CONFIG.STARTING_Y;
        
        // Direction facing (0: Down, 1: Left, 2: Right, 3: Up) - standard sprite sheet order
        this.facing = 0; 

        // --- VISUALS ---
        // Matches the ID in your assets folder
        this.spriteID = 'player_male'; 

        // --- RPG STATS ---
        // These match the IDs in index.html for easy updating
        this.stats = {
            hp: CONFIG.STARTING_HP,
            maxHp: CONFIG.STARTING_HP,
            mana: 50,
            maxMana: 50,
            stamina: 100,
            maxStamina: 100
        };

        // Base Attributes (The foundation of your "Classless" system)
        this.attributes = {
            strength: 5,
            agility: 5,
            intelligence: 5,
            constitution: 5,
            perception: 5
        };

        this.inventory = [];
    }

    /**
     * Attempts to move the player.
     * @param {number} dx - Change in X (-1, 0, 1)
     * @param {number} dy - Change in Y (-1, 0, 1)
     * @returns {boolean} true if move was successful
     */
    move(dx, dy) {
        // Update Facing Direction
        if (dy > 0) this.facing = 0; // Down
        if (dx < 0) this.facing = 1; // Left
        if (dx > 0) this.facing = 2; // Right
        if (dy < 0) this.facing = 3; // Up

        // Calculate Target Tile
        const newX = this.x + dx;
        const newY = this.y + dy;

        // 1. World Boundary Check
        if (newX < 0 || newX >= CONFIG.MAP_COLS || newY < 0 || newY >= CONFIG.MAP_ROWS) {
            return false; // Blocked by edge of map
        }

        // 2. (Future) Collision Check with Walls/NPCs would go here.

        // Commit Move
        this.x = newX;
        this.y = newY;
        
        return true;
    }

    // Call this when taking damage or using skills
    modifyStat(statName, amount) {
        if (!this.stats.hasOwnProperty(statName)) return;
        
        this.stats[statName] += amount;

        // Clamp values (Don't go below 0 or above Max)
        const maxKey = 'max' + statName.charAt(0).toUpperCase() + statName.slice(1); // e.g., maxHp
        if (this.stats[maxKey]) {
            if (this.stats[statName] > this.stats[maxKey]) this.stats[statName] = this.stats[maxKey];
        }
        if (this.stats[statName] < 0) this.stats[statName] = 0;
    }
}