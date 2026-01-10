/**
 * SPIRES ONLINE | LOGIC SYSTEM (logic.js)
 * Handles AI behavior, combat calculations, and vital regeneration.
 */

import { Game } from './game.js';

export const Logic = {
    // How often the AI "thinks" (every 30 frames = roughly twice a second)
    aiTickRate: 30,

    update() {
        this.updateVitals();
        
        // Only run AI logic on the specific tick rate to save CPU/Battery
        if (Game.state.frame % this.aiTickRate === 0) {
            this.updateAI();
        }
    },

    updateVitals() {
        const p = Game.state.player;
        const frame = Game.state.frame;

        // Passive Regeneration: Every 2 seconds (120 frames)
        if (frame % 120 === 0) {
            if (p.mana < p.maxMana) p.mana = Math.min(p.maxMana, p.mana + 2);
            if (p.energy < p.maxEnergy) p.energy = Math.min(p.maxEnergy, p.energy + 5);
            
            // Mood slightly fluctuates based on energy
            if (p.energy > 50 && p.mood < p.maxMood) p.mood = Math.min(p.maxMood, p.mood + 1);
            
            Game.ui.updateVitals();
        }
    },

    updateAI() {
        const { player, entities, currentMap } = Game.state;
        if (!currentMap) return;

        entities.forEach(en => {
            if (en.type !== 'goblin' || !en.alive) return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);

            // 1. ATTACK STATE: If adjacent, hit the player
            if (dist === 1) {
                player.hp = Math.max(0, player.hp - 5);
                Game.ui.log("Combat: Received -5 DMG from Goblin.");
                Game.ui.updateVitals();
                
                // If player dies (placeholder logic)
                if (player.hp <= 0) {
                    Game.ui.log("CRITICAL: Vital signs failing. Extraction required.");
                    // In a full build, we'd trigger a respawn here
                }
            } 
            
            // 2. CHASE STATE: If player is within 6 tiles, move toward them
            else if (dist < 7) {
                this.moveEntityToward(en, player.x, player.y);
            }
            
            // 3. IDLE STATE: Occasional random movement
            else if (Math.random() > 0.7) {
                this.moveEntityRandomly(en);
            }
        });
    },

    moveEntityToward(entity, targetX, targetY) {
        let dX = 0;
        let dY = 0;

        if (entity.x < targetX) dX = 1;
        else if (entity.x > targetX) dX = -1;
        else if (entity.y < targetY) dY = 1;
        else if (entity.y > targetY) dY = -1;

        this.applyMove(entity, dX, dY);
    },

    moveEntityRandomly(entity) {
        const dirs = [
            {x: 1, y: 0}, {x: -1, y: 0}, 
            {x: 0, y: 1}, {x: 0, y: -1}
        ];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        this.applyMove(entity, dir.x, dir.y);
    },

    applyMove(entity, dX, dY) {
        const { currentMap, player, entities } = Game.state;
        const nX = entity.x + dX;
        const nY = entity.y + dY;

        // Check map bounds
        if (nX < 0 || nX >= currentMap.size || nY < 0 || nY >= currentMap.size) return;

        // Check wall collision
        const isWall = currentMap.walls.some(w => w.x === nX && w.y === nY);
        
        // Check collision with player
        const isPlayer = (nX === player.x && nY === player.y);
        
        // Check collision with other entities
        const isEntity = entities.some(e => e.alive && e !== entity && e.x === nX && e.y === nY);

        if (!isWall && !isPlayer && !isEntity) {
            entity.x = nX;
            entity.y = nY;
        }
    }
};