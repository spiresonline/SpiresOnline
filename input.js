/**
 * SPIRES ONLINE | INPUT SYSTEM (input.js)
 * Professional ES Module Version
 */

import { Game } from './game.js';

export const Input = {
    keys: new Set(),
    lastMoveTime: 0,
    moveCooldown: 120,

    init() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys.add(key);
            this.handleInstantActions(key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key.toLowerCase());
        });

        this.startInputLoop();
    },

    handleInstantActions(key) {
        if (!Game.state.currentMap) return;

        if (key === ' ') {
            this.performAttack();
        }

        if (key === 'e') {
            this.performInteraction();
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

        let dX = 0;
        let dY = 0;

        if (this.keys.has('w') || this.keys.has('arrowup')) dY = -1;
        else if (this.keys.has('s') || this.keys.has('arrowdown')) dY = 1;
        else if (this.keys.has('a') || this.keys.has('arrowleft')) dX = -1;
        else if (this.keys.has('d') || this.keys.has('arrowright')) dX = 1;

        if (dX !== 0 || dY !== 0) {
            this.attemptMove(dX, dY);
            this.lastMoveTime = now;
        }
    },

    attemptMove(dX, dY) {
        const { player, currentMap, entities } = Game.state;
        const nX = player.x + dX;
        const nY = player.y + dY;

        if (nX < 0 || nX >= currentMap.size || nY < 0 || nY >= currentMap.size) {
            Game.exitToHub();
            return;
        }

        const isBlocked = currentMap.walls.some(w => w.x === nX && w.y === nY);
        const isEntityInWay = entities.some(en => en.alive && en.x === nX && en.y === nY);

        if (!isBlocked && !isEntityInWay) {
            player.x = nX;
            player.y = nY;
        }
    },

    performAttack() {
        const { player, entities } = Game.state;
        entities.forEach(en => {
            if (en.type === 'goblin' && en.alive) {
                const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
                if (dist <= 1) {
                    en.hp -= 20;
                    if (en.hp <= 0) {
                        en.alive = false;
                        player.gold += 25;
                        Game.ui.log("Target Neutralized. +25 Gold.");
                    } else {
                        Game.ui.log("Hit registered on Goblin.");
                    }
                }
            }
        });
    },

    performInteraction() {
        const { player, entities } = Game.state;
        entities.forEach(en => {
            const dist = Math.abs(player.x - en.x) + Math.abs(player.y - en.y);
            if (dist <= 1 && en.type === 'bartender') {
                Game.state.player.hp = Game.state.player.maxHp;
                Game.ui.updateVitals();
                Game.ui.log("Bartender: 'Drink up. That should patch those wounds.'");
            }
        });
    }
};