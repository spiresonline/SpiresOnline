/**
 * SPIRES ONLINE | LOGIC SYSTEM (logic.js)
 * Alpha 1.3: Skill XP, Floating Text, and Quest Tracking.
 */

import { Game } from './game.js';
import { LootTable } from './loot.js';

export const Logic = {
    aiTickRate: 60, 

    update() {
        // 1. Passive Regeneration (Based on Vitality Skill)
        this.updateVitals();
        
        // 2. Check for Zone Transitions
        this.checkPortals();
        
        // 3. AI Behavior
        if (Game.state.frame % this.aiTickRate === 0) {
            this.updateAI();
        }
    },

    checkPortals() {
        const { player, currentMap } = Game.state;
        if (!currentMap.portals) return;

        const portal = currentMap.portals.find(p => p.x === player.x && p.y === player.y);
        
        if (portal) {
            Game.ui.log(`System: Traveling to ${portal.target.toUpperCase()}...`);
            Game.loadMap(portal.target);
            player.x = portal.targetX;
            player.y = portal.targetY;
            
            // Auto-save on zone change
            Game.saveGame();
        }
    },

    updateVitals() {
        const p = Game.state.player;
        const frame = Game.state.frame;

        // Regen tick every 2 seconds
        if (frame % 120 === 0) {
            // Regen based on Vitality Level
            const vitBonus = p.skills.vitality.level * 0.5;
            
            if (p.hp < p.maxHp) p.hp = Math.min(p.maxHp, p.hp + 1 + vitBonus);
            if (p.mana < p.maxMana) p.mana = Math.min(p.maxMana, p.mana + 1);
            
            Game.ui.updateVitals();
        }
    },

    // --- XP & LEVELING SYSTEM ---
    gainXp(skillName, amount) {
        const p = Game.state.player;
        const skill = p.skills[skillName];
        if (!skill) return;

        skill.xp += amount;
        p.xp += amount; // Add to global total

        // Visual Float Text for XP
        Game.ui.showFloatText(p.x, p.y - 1, `+${amount} ${skillName.toUpperCase()}`, '#fbbf24');

        // Check Level Up (Simple formula: Level * 100 XP required)
        const reqXp = skill.level * 100;
        if (skill.xp >= reqXp) {
            skill.xp -= reqXp;
            skill.level++;
            
            // Stats Rewards
            if (skillName === 'vitality') p.maxHp += 10;
            
            Game.ui.log(`LEVEL UP! ${skillName.toUpperCase()} is now Level ${skill.level}.`);
            Game.ui.showFloatText(p.x, p.y - 2, "LEVEL UP!", "#3b82f6");
            
            // Save on Level Up
            Game.saveGame();
        }

        Game.ui.updateVitals();
    },

    // --- COMBAT SYSTEM ---
    playerAttack() {
        const { player, entities, worldItems } = Game.state;
        
        // Damage Math: Weapon + Blades Skill
        const weaponDmg = player.gear.weapon ? player.gear.weapon.stats.attack : 0;
        const skillDmg = player.skills.blades.level * 2;
        const totalDmg = Math.floor(2 + weaponDmg + skillDmg + (Math.random() * 2));

        entities.forEach(en => {
            if (!en.alive || en.type === 'npc') return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            
            if (dist <= 1) {
                // Hit!
                en.hp -= totalDmg;
                Game.ui.showFloatText(en.x, en.y, `-${totalDmg}`, '#fff');
                
                // Gain Attack XP
                this.gainXp('blades', 15);

                if (en.hp <= 0) {
                    this.handleKill(en);
                }
            }
        });
    },

    handleKill(enemy) {
        const { player, worldItems } = Game.state;
        
        enemy.alive = false;
        Game.ui.log(`Combat: Defeated ${enemy.type}.`);
        
        // 1. Check Quests
        this.checkQuestProgress('kill', enemy.type);

        // 2. Generate Loot
        const dropId = LootTable.generateDrop(enemy.type);
        if (dropId) {
            worldItems.push({ 
                x: enemy.x, 
                y: enemy.y, 
                itemId: dropId, 
                id: Date.now() 
            });
            Game.ui.showFloatText(enemy.x, enemy.y, "DROP!", "#a3e635");
        }
    },

    updateAI() {
        const { player, entities, currentMap } = Game.state;
        if (!currentMap) return;

        entities.forEach(en => {
            if (en.type === 'npc' || !en.alive) return;

            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);

            // Attack Player
            if (dist === 1) {
                // Defense Math: Gear + Defense Skill
                const gearDef = (player.gear.body?.stats.defense || 0) + (player.gear.head?.stats.defense || 0) + (player.gear.legs?.stats.defense || 0);
                const skillDef = player.skills.defense.level;
                
                // Incoming Damage
                const rawDmg = 8; // Base enemy damage
                const reduction = Math.min(rawDmg - 1, (gearDef + skillDef) / 2);
                const finalDmg = Math.floor(rawDmg - reduction);
                
                player.hp = Math.max(0, player.hp - finalDmg);
                
                // Visuals
                Game.ui.showFloatText(player.x, player.y, `-${finalDmg}`, '#ef4444');
                Game.ui.updateVitals();

                // Gain Defense XP (Training by getting hit)
                this.gainXp('defense', 10);
                this.gainXp('vitality', 2); // Getting hit hardens the body

                // Death Check
                if (player.hp <= 0) {
                    this.handlePlayerDeath();
                }
            } 
            // Chase Player
            else if (dist < 8) {
                this.moveEntityToward(en, player.x, player.y);
            }
        });
    },

    handlePlayerDeath() {
        Game.ui.log("SYSTEM: CRITICAL FAILURE. RESPONDENT DECEASED.");
        Game.ui.showFloatText(Game.state.player.x, Game.state.player.y, "DEAD", "#ff0000");
        
        // Respawn in Town
        Game.state.player.hp = Game.state.player.maxHp;
        Game.loadMap('town');
        Game.state.player.x = 15;
        Game.state.player.y = 15;
    },

    // --- QUEST LOGIC ---
    checkQuestProgress(type, targetId) {
        Game.state.quests.forEach(quest => {
            if (quest.completed) return;

            if (quest.type === type && quest.targetId === targetId) {
                quest.current++;
                Game.ui.log(`Quest Update: ${quest.title} (${quest.current}/${quest.required})`);

                if (quest.current >= quest.required) {
                    this.completeQuest(quest);
                }
                
                // Refresh UI Tracker
                this.updateQuestUI();
            }
        });
    },

    completeQuest(quest) {
        quest.completed = true;
        Game.ui.log(`QUEST COMPLETE: ${quest.title}!`);
        Game.ui.showFloatText(Game.state.player.x, Game.state.player.y, "QUEST DONE!", "#fbbf24");
        
        // Rewards
        if (quest.rewardXP) this.gainXp('vitality', quest.rewardXP); // General XP
        if (quest.rewardGold) {
            Game.state.player.gold += quest.rewardGold;
            Game.ui.log(`Reward: Received ${quest.rewardGold} Gold.`);
        }
    },

    updateQuestUI() {
        const list = document.getElementById('quest-list');
        if (!list) return;

        const activeQuests = Game.state.quests.filter(q => !q.completed);
        
        if (activeQuests.length === 0) {
            list.innerHTML = '<div class="text-xs text-slate-400 italic">No active objectives.</div>';
            return;
        }

        list.innerHTML = activeQuests.map(q => `
            <div class="bg-white/5 p-2 rounded border border-white/10">
                <div class="text-xs font-bold text-yellow-500">${q.title}</div>
                <div class="text-[10px] text-slate-400">${q.description}</div>
                <div class="mt-1 w-full bg-black h-1 rounded overflow-hidden">
                    <div class="bg-blue-500 h-full" style="width: ${(q.current / q.required) * 100}%"></div>
                </div>
                <div class="text-[9px] text-right mt-0.5">${q.current} / ${q.required}</div>
            </div>
        `).join('');
    }

    // (moveEntityToward helper remains the same as Alpha 1.2, omitted for brevity but assumed present)
    ,moveEntityToward(entity, targetX, targetY) {
        let dX = 0, dY = 0;
        if (entity.x < targetX) dX = 1;
        else if (entity.x > targetX) dX = -1;
        else if (entity.y < targetY) dY = 1;
        else if (entity.y > targetY) dY = -1;
        
        const { currentMap, player, entities } = Game.state;
        const nX = entity.x + dX;
        const nY = entity.y + dY;

        if (nX < 0 || nX >= currentMap.width || nY < 0 || nY >= currentMap.height) return;
        
        const isPlayer = (nX === player.x && nY === player.y);
        const isEntity = entities.some(e => e.alive && e !== entity && e.x === nX && e.y === nY);

        if (!isPlayer && !isEntity) {
            entity.x = nX;
            entity.y = nY;
        }
    }
};