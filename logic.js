/**
 * SPIRES ONLINE | LOGIC SYSTEM (logic.js)
 * Handles combat math, AI behavior, and vital regeneration.
 */

import { Game } from './game.js';
import { LootTable } from './loot.js';

export const Logic = {
    aiTickRate: 60, // AI acts once per second at 60fps

    update() {
        this.updateVitals();
        
        if (Game.state.frame % this.aiTickRate === 0) {
            this.updateAI();
        }
    },

    updateVitals() {
        const p = Game.state.player;
        const frame = Game.state.frame;

        // Passive regeneration every 2 seconds
        if (frame % 120 === 0) {
            if (p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + 0.5);
            if (p.mana < p.maxMana) p.mana = Math.min(p.maxMana, p.mana + 2);
            if (p.energy < p.maxEnergy) p.energy = Math.min(p.maxEnergy, p.energy + 5);
            
            Game.ui.updateVitals();
        }
    },

    updateAI() {
        const { player, entities, currentMap } = Game.state;
        if (!currentMap) return;

        entities.forEach(en => {
            if (en.type !== 'goblin' || !en.alive) return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);

            // Attack if adjacent
            if (dist === 1) {
                const defense = player.gear.body ? player.gear.body.stats.defense : 0;
                const dmg = Math.max(1, 5 - (defense / 5));
                
                player.hp = Math.max(0, player.hp - dmg);
                Game.ui.log(`Combat: Goblin hit you for ${dmg.toFixed(1)} DMG.`);
                Game.ui.updateVitals();
            } 
            // Aggro/Pursuit range
            else if (dist < 7) {
                this.moveEntityToward(en, player.x, player.y);
            }
            // Idle wander
            else if (Math.random() > 0.7) {
                this.moveEntityRandomly(en);
            }
        });
    },

    playerAttack() {
        const { player, entities, worldItems } = Game.state;
        const weaponBonus = player.gear.weapon ? player.gear.weapon.stats.attack : 0;
        const attackPower = 15 + weaponBonus;

        entities.forEach(en => {
            if (!en.alive || en.type === 'bartender') return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            
            if (dist <= 1) {
                en.hp -= attackPower;
                Game.ui.log(`Combat: Struck Goblin for ${attackPower} DMG.`);

                if (en.hp <= 0) {
                    en.alive = false;
                    Game.ui.log("Combat: Enemy neutralized.");
                    
                    // Trigger Loot System
                    const dropId = LootTable.generateDrop(en.type);
                    if (dropId) {
                        worldItems.push({ 
                            x: en.x, 
                            y: en.y, 
                            itemId: dropId, 
                            id: Date.now() 
                        });
                        Game.ui.log(`Loot: ${en.type} dropped an item.`);
                    }
                }
            }
        });
    },

    moveEntityToward(entity, targetX, targetY) {
        let dX = 0, dY = 0;
        if (entity.x < targetX) dX = 1;
        else if (entity.x > targetX) dX = -1;
        else if (entity.y < targetY) dY = 1;
        else if (entity.y > targetY) dY = -1;
        this.applyMove(entity, dX, dY);
    },

    moveEntityRandomly(entity) {
        const dirs = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        this.applyMove(entity, dir.x, dir.y);
    },

    applyMove(entity, dX, dY) {
        const { currentMap, player, entities } = Game.state;
        const nX = entity.x + dX;
        const nY = entity.y + dY;

        if (nX < 0 || nX >= currentMap.size || nY < 0 || nY >= currentMap.size) return;
        
        const isPlayer = (nX === player.x && nY === player.y);
        const isEntity = entities.some(e => e.alive && e !== entity && e.x === nX && e.y === nY);

        if (!isPlayer && !isEntity) {
            entity.x = nX;
            entity.y = nY;
        }
    }
};