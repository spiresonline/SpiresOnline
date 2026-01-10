/**
 * SPIRES ONLINE | LOGIC SYSTEM (logic.js)
 * Alpha 1.2: Portal Traversal, Stat-based Combat, and AI.
 */

import { Game } from './game.js';
import { LootTable } from './loot.js';

export const Logic = {
    aiTickRate: 60, // AI updates once per second (at 60 FPS)

    update() {
        // 1. Passive Regeneration
        this.updateVitals();
        
        // 2. Check for Zone Transitions
        this.checkPortals();
        
        // 3. AI Behavior (Combat/Movement)
        if (Game.state.frame % this.aiTickRate === 0) {
            this.updateAI();
        }
    },

    checkPortals() {
        const { player, currentMap } = Game.state;
        if (!currentMap.portals) return;

        // Check if player is standing on a portal
        const portal = currentMap.portals.find(p => p.x === player.x && p.y === player.y);
        
        if (portal) {
            Game.ui.log(`System: Traveling to ${portal.target.toUpperCase()}...`);
            
            // Switch Maps
            Game.loadMap(portal.target);
            
            // Set Player Position in new map
            player.x = portal.targetX;
            player.y = portal.targetY;
        }
    },

    updateVitals() {
        const p = Game.state.player;
        const frame = Game.state.frame;

        // Regen tick every 2 seconds (120 frames)
        if (frame % 120 === 0) {
            // Regen Rates based on Stats (Stamina/Intellect)
            const hpRegen = 0.5 + (p.stats.sta * 0.1);
            const manaRegen = 1 + (p.stats.int * 0.2);

            if (p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + hpRegen);
            if (p.mana < p.maxMana) p.mana = Math.min(p.maxMana, p.mana + manaRegen);
            
            // Update UI Bars
            Game.ui.updateVitals();
        }
    },

    updateAI() {
        const { player, entities, currentMap } = Game.state;
        if (!currentMap) return;

        entities.forEach(en => {
            // Only enemies (Goblins) react. NPCs (Town) just stand or wander safely.
            if (en.type !== 'goblin' || !en.alive) return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);

            // Attack Range
            if (dist === 1) {
                // Defense Calculation: Gear Defense + Agility
                const gearDef = player.gear.body ? player.gear.body.stats.defense : 0;
                const totalDef = gearDef + (player.stats.agi * 0.5);
                
                // Damage Calculation
                const rawDmg = 5; 
                const finalDmg = Math.max(1, rawDmg - (totalDef / 5));
                
                player.hp = Math.max(0, player.hp - finalDmg);
                Game.ui.log(`Combat: Took ${finalDmg.toFixed(1)} DMG.`);
                Game.ui.updateVitals();
            } 
            // Pursuit Range
            else if (dist < 8) {
                this.moveEntityToward(en, player.x, player.y);
            }
            // Idle Wander
            else if (Math.random() > 0.8) {
                this.moveEntityRandomly(en);
            }
        });
    },

    playerAttack() {
        const { player, entities, worldItems } = Game.state;
        
        // Damage Math: Weapon + Strength
        const weaponDmg = player.gear.weapon ? player.gear.weapon.stats.attack : 0;
        const strBonus = player.stats.str * 1.5;
        const totalDmg = 5 + weaponDmg + strBonus;

        entities.forEach(en => {
            if (!en.alive || en.type === 'npc') return; // Cannot hurt NPCs

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            
            if (dist <= 1) {
                en.hp -= totalDmg;
                Game.ui.log(`Combat: Hit ${en.type} for ${totalDmg.toFixed(0)} DMG.`);

                if (en.hp <= 0) {
                    en.alive = false;
                    Game.ui.log(`Combat: ${en.type} neutralized.`);
                    
                    // Award XP (Simple)
                    player.xp += 20;
                    if (player.xp >= player.maxXp) {
                        player.xp = 0;
                        player.level++;
                        player.maxXp *= 1.5;
                        Game.ui.log(`LEVEL UP! You are now Level ${player.level}.`);
                    }
                    Game.ui.updateVitals();

                    // Generate Loot
                    const dropId = LootTable.generateDrop(en.type);
                    if (dropId) {
                        worldItems.push({ 
                            x: en.x, 
                            y: en.y, 
                            itemId: dropId, 
                            id: Date.now() 
                        });
                        Game.ui.log("Loot: Enemy dropped an item.");
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

        if (nX < 0 || nX >= currentMap.width || nY < 0 || nY >= currentMap.height) return;
        
        // Collision Checks
        const isPlayer = (nX === player.x && nY === player.y);
        const isEntity = entities.some(e => e.alive && e !== entity && e.x === nX && e.y === nY);

        if (!isPlayer && !isEntity) {
            entity.x = nX;
            entity.y = nY;
        }
    }
};