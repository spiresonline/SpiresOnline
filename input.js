/**
 * SPIRES ONLINE | INPUT SYSTEM (input.js)
 * Alpha 1.3: NPC Quest Triggers and Dynamic Interactions.
 */

import { Game } from './game.js';
import { Inventory } from './inventory.js';
import { ItemDatabase } from './items.js';
import { Logic } from './logic.js';

export const Input = {
    keys: new Set(),
    lastMoveTime: 0,
    moveCooldown: 120, // Speed of movement

    init() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys.add(key);
            this.handleInstantActions(e.key, key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        this.startInputLoop();
    },

    handleInstantActions(originalKey, lowerKey) {
        if (!Game.state.currentMap) return;

        // --- COMBAT & INTERACTION ---
        if (lowerKey === ' ') {
            Logic.playerAttack();
        }
        if (lowerKey === 'e') {
            this.performInteraction();
        }

        // --- UI HOTKEYS ---
        if (lowerKey === 'i') window.UI.toggleModal('inventory');
        if (lowerKey === 'n') window.UI.toggleModal('talents');
        if (originalKey === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        }
    },

    startInputLoop() {
        const checkMovement = () => {
            if (Game.state.isRunning) {
                this.processMovement();
            }
            requestAnimationFrame(checkMovement);
        };
        checkMovement();
    },

    processMovement() {
        const now = Date.now();
        if (now - this.lastMoveTime < this.moveCooldown) return;

        // Block movement if typing in chat or modal is open
        const isChatFocused = document.activeElement === document.getElementById('chat-input');
        const isModalOpen = document.querySelector('.modal:not(.hidden)');
        
        if (isChatFocused || isModalOpen) return;

        let dX = 0;
        let dY = 0;

        if (this.keys.has('w') || this.keys.has('arrowup')) dY = -1;
        else if (this.keys.has('s') || this.keys.has('arrowdown')) dY = 1;
        
        if (dY === 0) {
            if (this.keys.has('a') || this.keys.has('arrowleft')) dX = -1;
            else if (this.keys.has('d') || this.keys.has('arrowright')) dX = 1;
        }

        if (dX !== 0 || dY !== 0) {
            this.attemptMove(dX, dY);
            this.lastMoveTime = now;
        }
    },

    attemptMove(dX, dY) {
        const { player, currentMap, entities } = Game.state;
        const nX = player.x + dX;
        const nY = player.y + dY;

        // 1. Boundary
        if (nX < 0 || nX >= currentMap.width || nY < 0 || nY >= currentMap.height) return;

        // 2. Collision
        const isEntityInWay = entities.some(en => en.alive && en.x === nX && en.y === nY);
        
        if (!isEntityInWay) {
            player.x = nX;
            player.y = nY;
        }
    },

    performInteraction() {
        const { player, worldItems, entities } = Game.state;

        // 1. Pick up Items
        const itemIndex = worldItems.findIndex(i => i.x === player.x && i.y === player.y);
        if (itemIndex !== -1) {
            const worldItem = worldItems[itemIndex];
            const itemData = ItemDatabase[worldItem.itemId];
            if (Inventory.addItem(itemData)) {
                worldItems.splice(itemIndex, 1);
                // Play sound logic here later
            }
            return;
        }

        // 2. Talk to NPCs
        entities.forEach(en => {
            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            
            if (dist <= 1 && en.type === 'npc') {
                this.handleNpcDialogue(en);
            }
        });
    },

    handleNpcDialogue(npc) {
        const { quests } = Game.state;

        if (npc.id === 'questgiver') {
            // Check if we already have the quest
            const hasQuest = quests.find(q => q.id === 'q_goblins');
            
            if (!hasQuest) {
                // ASSIGN QUEST
                Game.state.quests.push({
                    id: 'q_goblins',
                    title: "Cull the Weak",
                    description: "Captain Vance wants you to kill 5 Goblins in the Wilds.",
                    type: 'kill',
                    targetId: 'goblin',
                    current: 0,
                    required: 5,
                    rewardXP: 50,
                    rewardGold: 100,
                    completed: false
                });
                
                Game.ui.log("Vance: 'The Wilds are crawling with filth. Kill 5 Goblins for me.'");
                Game.ui.showFloatText(npc.x, npc.y, "QUEST ACCEPTED", "#fbbf24");
                Logic.updateQuestUI(); // Update tracker
            } 
            else if (hasQuest.completed) {
                Game.ui.log("Vance: 'Good work, mercenary. I'll have more for you later.'");
            } 
            else {
                Game.ui.log(`Vance: 'You still have ${hasQuest.required - hasQuest.current} Goblins to kill. Get moving.'`);
            }
        }
        
        else if (npc.id === 'bartender') {
            Game.state.player.hp = Game.state.player.maxHp;
            Game.ui.updateVitals();
            Game.ui.log("Barman: 'Drink this. It'll put hair on your chest.' (HP Restored)");
        } 
        
        else if (npc.id === 'guard') {
            Game.ui.log("Guard: 'Keep your weapon sharp. The forest is dangerous at night.'");
        }
    }
};